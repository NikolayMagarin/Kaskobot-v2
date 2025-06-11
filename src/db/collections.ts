import { BotConfigData, ChatHistoryData, ChatSettingsData } from './documents';

export interface BotConfigQuery {
  collection: 'configs';
  docId: 'bot';
  data: BotConfigData;
}

export interface ChatHistoryQuery {
  collection: 'chathistory';
  docId: string; // chat id
  data: ChatHistoryData;
}

export interface ChatSettingsQuery {
  collection: 'chatsettings';
  docId: string; // chat id
  data: ChatSettingsData;
}

export type DocumentQuery =
  | BotConfigQuery
  | ChatHistoryQuery
  | ChatSettingsQuery;
