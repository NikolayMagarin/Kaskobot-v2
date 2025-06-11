import { Telegraf } from 'telegraf';
import { AdditionalContext } from './messageContent';
import {
  getBotConfig,
  getChatHistory,
  getChatSettings,
  getPreferredUserName,
  setChatHistory,
} from '../../../db/shortcuts';
import { MAX_HISTORY_LENGTH, processChat } from './processChat';
import { getAnalyzedMessageContent } from './analyzeMessage/analyzeMessage';
import { tg } from '../../telegram';

/**
 * This map is here to make sure that bot processing only one message at time from same chat
 *
 * key: chat id
 *
 * value: if true than need to process chat again after current processing (because chat history was updated while initial processing)
 */
const processingChats = new Map<number, boolean>();

function maybeProcessChat(chatId: number) {
  if (processingChats.has(chatId)) {
    // process later
    processingChats.set(chatId, true);
  } else {
    // process now
    processingChats.set(chatId, false);
    processChat(chatId).then(() => {
      maybeProcessChatAgain(chatId);
    });
  }
}

function maybeProcessChatAgain(chatId: number) {
  if (!processingChats.get(chatId)) {
    // no new messages to process
    processingChats.delete(chatId);
  } else {
    // process new messages
    processingChats.set(chatId, false);
    processChat(chatId).then(() => {
      maybeProcessChatAgain(chatId);
    });
  }
}

// Content types that take time to analyze
const EXPENSIVE_CONTENT_TYPES: Set<AdditionalContext['content']['type']> =
  new Set(['video', 'audio', 'voice', 'videoNote']);

export function handleMessages(bot: Telegraf<AdditionalContext>) {
  bot.on('message', async (ctx) => {
    if (!ctx.content.hasContent) {
      return;
    }

    const chatId = ctx.chat.id;

    if (!(await getChatSettings(chatId))?.bot.enabled) return;

    const userId = ctx.message.from.id;
    const messageId = ctx.message.message_id;
    const userName =
      (await getPreferredUserName(chatId, userId)) ||
      ctx.message.from.first_name;
    const content = ctx.content;

    let history = await getChatHistory(chatId);

    if (EXPENSIVE_CONTENT_TYPES.has(content.type)) {
      tg.setMessageReaction(chatId, messageId, [
        { type: 'emoji', emoji: '👀' },
      ]);
    }

    const analyzedContent = await getAnalyzedMessageContent(content);

    if (EXPENSIVE_CONTENT_TYPES.has(content.type)) {
      tg.setMessageReaction(chatId, messageId, []);
    }

    history = {
      messages: history.messages.concat({
        id: messageId,
        sender: { id: userId, name: userName },
        content: analyzedContent,
        date: Date.now(),
      }),
    };

    if (history.messages.length > MAX_HISTORY_LENGTH) {
      history.messages.splice(0, history.messages.length - MAX_HISTORY_LENGTH);
    }

    setChatHistory(chatId, history);

    maybeProcessChat(chatId);
  });
}
