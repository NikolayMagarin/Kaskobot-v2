import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import {
  Animation,
  Audio,
  Document,
  PhotoSize,
  Sticker,
  Video,
  VideoNote,
  Voice,
} from 'telegraf/typings/core/types/typegram';
import { ChatHistoryMessageContent } from '../../../db/documents';

export interface AdditionalContext extends Context {
  content: MessageContent;
}

export type MessageContent = {
  text?: string;
  photo?: PhotoSize;
  video?: Video;
  audio?: Audio;
  sticker?: Sticker;
  videoNote?: VideoNote;
  voice?: Voice;
  document?: Document;
  animation?: Animation;
} & (
  | {
      hasContent: true;
      type: ChatHistoryMessageContent['type'];
    }
  | {
      hasContent: false;
      type: null;
    }
);

// Если видео/аудио/гс/кружок слишком долгие, то бот их не воспринимает вообще
// Надо бы сделать потом чтобы он их воспринимал, но не смотрел
const MAX_VIDEO_DURATION = 300;
const MAX_VOICE_DURATION = 300;
const MAX_AUDIO_DURATION = 300;
const MAX_VIDEONOTE_DURATION = 300;

// Максимальный размер любого файла (телеграм не дает ботам скачивать файлы больше 20мб)
const MAX_FILE_SIZE = 1024 * 1024 * 20;

export function registerMessageContent(bot: Telegraf<AdditionalContext>) {
  bot.on('message', (ctx, next) => {
    ctx.content = {
      hasContent: false,
      type: null,
    };
    next();
  });

  bot.on(message('text'), (ctx, next) => {
    ctx.content.hasContent = true;
    ctx.content.type = 'text';
    ctx.content.text = ctx.message.text;
    next();
  });
  bot.on(message('photo'), (ctx, next) => {
    const photo = ctx.message.photo[Math.floor(ctx.message.photo.length / 2)];
    if (photo.file_size && photo.file_size < MAX_FILE_SIZE) {
      ctx.content.hasContent = true;
      ctx.content.type = 'photo';
      ctx.content.photo = photo;
      if (ctx.message.caption) {
        ctx.content.text = ctx.message.caption;
      }
    }
    next();
  });
  bot.on(message('video'), (ctx, next) => {
    if (
      ctx.message.video.duration < MAX_VIDEO_DURATION &&
      ctx.message.video.file_size &&
      ctx.message.video.file_size < MAX_FILE_SIZE
    ) {
      ctx.content.hasContent = true;
      ctx.content.type = 'video';
      ctx.content.video = ctx.message.video;
      if (ctx.message.caption) {
        ctx.content.text = ctx.message.caption;
      }
    }
    next();
  });
  bot.on(message('video_note'), (ctx, next) => {
    if (
      ctx.message.video_note.duration < MAX_VIDEONOTE_DURATION &&
      ctx.message.video_note.file_size &&
      ctx.message.video_note.file_size < MAX_FILE_SIZE
    ) {
      ctx.content.hasContent = true;
      ctx.content.type = 'videoNote';
      ctx.content.videoNote = ctx.message.video_note;
    }
    next();
  });
  bot.on(message('voice'), (ctx, next) => {
    if (
      ctx.message.voice.duration < MAX_VOICE_DURATION &&
      ctx.message.voice.file_size &&
      ctx.message.voice.file_size < MAX_FILE_SIZE
    ) {
      ctx.content.hasContent = true;
      ctx.content.type = 'voice';
      ctx.content.voice = ctx.message.voice;
      if (ctx.message.caption) {
        ctx.content.text = ctx.message.caption;
      }
    }
    next();
  });
  bot.on(message('animation'), (ctx, next) => {
    ctx.content.hasContent = true;
    ctx.content.type = 'animation';
    ctx.content.animation = ctx.message.animation;
    if (ctx.message.caption) {
      ctx.content.text = ctx.message.caption;
    }
    next();
  });
  bot.on(message('document'), (ctx, next) => {
    ctx.content.hasContent = true;
    ctx.content.type = 'document';
    ctx.content.document = ctx.message.document;
    if (ctx.message.caption) {
      ctx.content.text = ctx.message.caption;
    }
    next();
  });
  bot.on(message('sticker'), (ctx, next) => {
    ctx.content.hasContent = true;
    ctx.content.type = 'sticker';
    ctx.content.sticker = ctx.message.sticker;
    next();
  });
  bot.on(message('audio'), (ctx, next) => {
    if (
      ctx.message.audio.duration < MAX_AUDIO_DURATION &&
      ctx.message.audio.file_size &&
      ctx.message.audio.file_size < MAX_FILE_SIZE
    ) {
      ctx.content.hasContent = true;
      ctx.content.type = 'audio';
      ctx.content.audio = ctx.message.audio;
    }
    next();
  });
}
