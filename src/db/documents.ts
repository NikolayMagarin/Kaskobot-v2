export interface BotConfigData {
  allowedChats: number[];
}

export interface ChatHistoryData {
  messages: Array<{
    id: number;
    date: number;
    sender: { id: number; name: string };
    content: ChatHistoryMessageContent;
  }>;
}

export interface ChatSettingsData {
  bot: {
    enabled: boolean;
    triggerReplyChance: number;
    preferredUserNames: Record<number, string>;
  };
  chat: {
    members: string[];
  };
}

export type ChatHistoryMessageContent =
  | TextContent
  | PhotoContent
  | VideoContent
  | AudioContent
  | DocumentContent
  | VoiceContent
  | AnimationContent
  | StickerContent
  | VideoNoteContent;

interface TextContent {
  type: 'text';
  text: string;
}

interface PhotoContent {
  type: 'photo';
  fileId: string;
  caption?: string;
}

interface VideoContent {
  type: 'video';
  fileId: string;
  duration: number;
  fileName?: string;
  caption?: string;
  thumbnailFileId?: string;
  description: string;
  transcription: string;
}

interface AudioContent {
  type: 'audio';
  fileId: string;
  duration: number;
  fileName?: string;
  caption?: string;
  transcription: string;
}

interface DocumentContent {
  type: 'document';
  fileId: string;
  fileSize?: number;
  fileName?: string;
  caption?: string;
}

interface VoiceContent {
  type: 'voice';
  fileId: string;
  duration: number;
  caption?: string;
  transcription: string;
}

interface AnimationContent {
  type: 'animation';
  fileId: string;
  duration: number;
  fileName?: string;
  caption?: string;
  thumbnailFileId?: string;
  description?: string;
}

interface StickerContent {
  type: 'sticker';
  fileId: string;
  animated: boolean;
  thumbnailFileId?: string;
  description?: string;
}

interface VideoNoteContent {
  type: 'videoNote';
  fileId: string;
  duration: number;
  thumbnailFileId?: string;
  description: string;
  transcription: string;
}
