import { ChatCompletionContentPartImage } from 'groq-sdk/resources/chat/completions';
import { aiChat, groq } from '../../../groq';

export async function shouldReply(
  chatMessages: string[],
  images: ChatCompletionContentPartImage[],
  desireScore: number
): Promise<boolean> {
  const promptText = `
Ты — аналитик группового чата. Определи, нужно ли боту по имени Каскобот отвечать на последнее сообщение, учитывая контекст беседы и средний уровень желания отвечать ({desire_score}).
### Правила оценки:
1. Ответ нужен, если:
    - Сообщение прямо обращено к боту (есть упоминание Каскобота или явный вопрос)
    - Сообщение требует реакции (например, вопрос группе, где бот может помочь)
    - Бот может добавить ценную информацию по теме
    - В беседе возникла пауза, и ответ бота уместен
2. Ответ не нужен, если:
    - Сообщение не требует ответа (риторическое, эмоциональная реакция)
    - Беседа активная и ответ бота будет прерывать поток
    - Сообщение адресовано конкретному человеку, а не боту

### Контекст чата (последние сообщения, анализируй их все, а не только последнее):
${chatMessages.join('\n')}


### Инструкция:
Оцени уместность ответа, учитывая:
1. Контекст беседы
2. Явные сигналы (обращения, вопросы)
3. Уровень желания отвечать (${desireScore}): чем выше, тем больше склоняйся к ответу даже в пограничных случаях

### Формат ответа:
\`\`\`json
{{
  "should_respond": true/false,
  "reason": "краткое обоснование решения",
  "confidence": 0-1 // уверенность в решении
}}
\`\`\``.trimStart();

  const response = await aiChat({
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: promptText }, ...images],
      },
    ],
    temperature: 0.2,
  });

  if (!response.choices[0].message.content) {
    return false;
  }

  return parseResponse(response.choices[0].message.content.trim());
}

function parseResponse(responseText: string): boolean {
  const matches = [
    ...responseText.matchAll(/should_respond.{0,4}(false|true)/g),
  ];

  let forTrue = 0;
  let forFalse = 0;

  for (const match of matches) {
    if (match[1].trim() === 'true') forTrue++;
    else if (match[1].trim() === 'false') {
      // const matches = [
      //   ...responseText.matchAll(/[\s\S]{5}should_respond[\s\S]*}/gim),
      // ];

      // if (matches.length === 1) {
      //   console.debug('[bot] Not replying: ' + match[0]);
      // }
      forFalse++;
    }
  }

  if (forTrue > forFalse) return true;
  if (forTrue < forFalse) return false;

  console.error('[bot] Cannot deside to reply or not', responseText);
  return false;
}
