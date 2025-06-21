import { ChatHistoryData, ChatSettingsData } from './documents';
import { getDocument, setDocument } from './firestore';

export async function getChatHistory(chatId: number) {
  let history = await getDocument('chathistory', chatId.toString());
  if (!history) {
    history = createDefaultHistory();
    setChatHistory(chatId, history);
  }
  return history;
}

export function setChatHistory(chatId: number, history: ChatHistoryData) {
  setDocument('chathistory', chatId.toString(), history);
}

export function getBotConfig() {
  return getDocument('configs', 'bot');
}

export async function getBotId() {
  return (await getBotConfig())?.botId;
}

export async function getChatSettings(chatId: number) {
  let settings = await getDocument('chatsettings', chatId.toString());
  if (!settings) {
    settings = createDefaultSettings();
    setChatSettings(chatId, settings);
  }
  return settings;
}

export function setChatSettings(chatId: number, settings: ChatSettingsData) {
  setDocument('chatsettings', chatId.toString(), settings);
}

export async function editChatSettings(
  chatId: number,
  editFunc: (settings: ChatSettingsData) => ChatSettingsData | void
) {
  let settings = await getChatSettings(chatId);

  settings = JSON.parse(JSON.stringify(settings));

  editFunc(settings);
  setChatSettings(chatId, settings);
}

export async function getPreferredUserName(
  chatId: number,
  userId: number
): Promise<string | undefined> {
  const settings = await getChatSettings(chatId);
  return settings.bot.preferredUserNames[userId];
}

function createDefaultHistory(): ChatHistoryData {
  return {
    messages: [],
  };
}

function createDefaultSettings(): ChatSettingsData {
  return {
    bot: {
      enabled: true,
      triggerReplyChance: 0.6,
      preferredUserNames: {},
    },
    chat: {
      members: [],
    },
  };
}
