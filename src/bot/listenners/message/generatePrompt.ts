import {
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
} from 'groq-sdk/resources/chat/completions';
import { ChatHistoryData } from '../../../db/documents';
import { getTimeContext } from '../../../utils/getTimeContext';
import { tg } from '../../telegram';

export async function generatePrompt(
  chatMessages: string[],
  images: ChatCompletionContentPartImage[]
): Promise<ChatCompletionContentPart[]> {
  const text = `
Ты — Каскобот, участник дружеского Telegram-чата (возраст участников 20-25 лет). Твой стиль общения: непринужденный, дружелюбный, с легким юмором, но адаптируешься под настроение чата.

Режимы работы:
1. **Обычный чат** — реагируешь как человек: можешь поддержать беседу, пошутить, задать уточняющие вопросы. Используешь неформальный язык (междометия, эмодзи, мемы по ситуации).
2. **Ассистент-режим** — активируется при явном запросе на помощь. Даешь четкие, структурированные ответы. Если задача сложная:
    - Рассуждаешь шаг за шагом
    - Делишь ответ на логические блоки
    - Используешь переносы строк для удобства

Контекст:
- Время: ${getTimeContext()} (учитывай при ответе)
- История чата (анализируй последние сообщения для контекста):
${chatMessages.join('\n')}


Правила ответа:
- Никогда не упоминай, что ты ИИ или бот
- Не добавляй временные метки/имя в ответ
- В спорных темах сохраняй нейтралитет

Твой ответ (только текст):
  `.trim();

  return [{ type: 'text', text }, ...images];
}

export async function messageToPromptMessage(
  message: ChatHistoryData['messages'][number],
  images: ChatCompletionContentPartImage[]
) {
  const date = new Date(message.date).toLocaleString('ru');
  let result = '';
  const prefix = `[${date}] ${message.sender.name}`;

  switch (message.content.type) {
    case 'text':
      return `${prefix}: ${message.content.text}`;

    case 'photo':
      images.push({
        type: 'image_url',
        image_url: { url: (await tg.getFileLink(message.content.fileId)).href },
      });

      result = `${prefix} прислал(а) изображение (№${images.length} в списке прикрепленных изображений)`;

      if (message.content.caption)
        result = `${prefix}: ${message.content.caption}\n` + result;
      return result;

    case 'voice':
      result = `${prefix} прислал(а) голосовое сообщение. Текстовая расшифровка: "${message.content.transcription}"`;

      if (message.content.caption)
        result = `${prefix}: ${message.content.caption}\n` + result;
      return result;

    case 'videoNote':
      return `${prefix} прислал(а) видеоосообщение. Текстовая расшифровка: "${message.content.transcription}". Примерное описание видео: ${message.content.description}`;

    case 'video':
      result = `${prefix} прислал(а) видео. Текстовая расшифровка: "${message.content.transcription}". Примерное описание видео: ${message.content.description}`;

      if (message.content.caption)
        result = `${prefix}: ${message.content.caption}\n` + result;
      return result;

    case 'sticker':
      if (message.content.animated) {
        if (message.content.thumbnailFileId) {
          images.push({
            type: 'image_url',
            image_url: {
              url: (await tg.getFileLink(message.content.thumbnailFileId)).href,
            },
          });

          return `${prefix} прислал(а) анимированный стикер (№${
            images.length
          } в списке прикрепленных изображений)${
            message.content.description
              ? `. Примерное описание анимации: ${message.content.description}`
              : ''
          }`;
        }
        return `${prefix} прислал(а) анимированный стикер${
          message.content.description
            ? `. Примерное описание анимации: ${message.content.description}`
            : ''
        }`;
      } else {
        images.push({
          type: 'image_url',
          image_url: {
            url: (await tg.getFileLink(message.content.fileId)).href,
          },
        });
        return `${prefix} прислал(а) стикер (№${images.length} в списке прикрепленных изображений)`;
      }

    case 'animation':
      if (message.content.thumbnailFileId) {
        images.push({
          type: 'image_url',
          image_url: {
            url: (await tg.getFileLink(message.content.thumbnailFileId)).href,
          },
        });

        return `${prefix} прислал(а) gif-анимацию${
          message.content.fileName
            ? ` с названием "${message.content.fileName}"`
            : ''
        } (№${images.length} в списке прикрепленных изображений)${
          message.content.description
            ? `. Примерное описание анимации: ${message.content.description}`
            : ''
        }`;
      }
      return `${prefix} прислал(а) gif-анимацию${
        message.content.fileName
          ? ` с названием "${message.content.fileName}"`
          : ''
      }${
        message.content.description
          ? `. Примерное описание анимации: ${message.content.description}`
          : ''
      }`;

    case 'audio':
      result = `${prefix} прислал(а) аудио. Текстовая расшифровка: "${message.content.transcription}"`;

      if (message.content.caption)
        result = `${prefix}: ${message.content.caption}\n` + result;
      return result;

    case 'document':
      result = `${prefix} прислал(а) файл${
        message.content.fileName
          ? ` с названием "${message.content.fileName}"`
          : ''
      }${
        message.content.fileSize
          ? `. Размер файла ${message.content.fileSize} байт`
          : ''
      }`;

      if (message.content.caption)
        result = `${prefix}: ${message.content.caption}\n` + result;
      return result;

    default:
      console.error('[bot] Unknown message content type to analyze', message);
      return '';
  }
}
