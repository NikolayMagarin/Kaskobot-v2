import { ChatCompletionContentPartImage } from 'groq-sdk/resources/chat/completions';
import {
  getBotId,
  getChatHistory,
  getChatSettings,
  setChatHistory,
} from '../../../db/shortcuts';
import { aiChat } from '../../../groq';
import { tg } from '../../telegram';
import { generatePrompt, messageToPromptMessage } from './generatePrompt';
import { shouldReply } from './shouldReply';

export const MAX_HISTORY_LENGTH = 10;

export async function processChat(chatId: number) {
  let history = await getChatHistory(chatId);
  if (!history?.messages.length) {
    return;
  }

  const images: ChatCompletionContentPartImage[] = [];

  const chatMessages = await Promise.all(
    [...history.messages]
      .reverse()
      .map((m) => messageToPromptMessage(m, images))
  );
  chatMessages.reverse();

  images.splice(5);

  const desireScore =
    (await getChatSettings(chatId))?.bot.triggerReplyChance ?? 0.2;

  if (desireScore === 0) return;
  if (!(await shouldReply(chatMessages, images, desireScore))) {
    return;
  }

  tg.sendChatAction(chatId, 'typing');

  const response = await aiChat({
    messages: [
      { role: 'user', content: await generatePrompt(chatMessages, images) },
    ],
    temperature: 0.7,
  });

  const botMessage = response.choices[0].message.content;

  if (!botMessage) {
    return;
  }

  const { message_id: messageId } = await tg.sendMessage(chatId, botMessage);

  history = {
    messages: history.messages.concat({
      id: messageId,
      sender: { id: (await getBotId()) || 0, name: 'Каскобот' },
      content: { type: 'text', text: botMessage },
      date: Date.now(),
    }),
  };

  if (history.messages.length > MAX_HISTORY_LENGTH) {
    history.messages.splice(0, history.messages.length - MAX_HISTORY_LENGTH);
  }

  setChatHistory(chatId, history);
}
