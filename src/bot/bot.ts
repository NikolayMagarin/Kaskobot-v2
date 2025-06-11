import { Telegraf } from 'telegraf';
import { config } from '../config';
import { handleCommands } from './commands';
import {
  AdditionalContext,
  registerMessageContent,
} from './listenners/message/messageContent';
import { handleMessages } from './listenners/message';
import { getBotConfig } from '../db/shortcuts';

const bot = new Telegraf<AdditionalContext>(config.telegramBotToken);

bot.use(async (ctx, next) => {
  const allowedChats = (await getBotConfig())?.allowedChats;

  if (ctx.chat && allowedChats?.includes(ctx.chat.id)) {
    next();
  } else {
    console.log(
      `[bot] Chat ${ctx.chat?.id} is not in allowed chat list [${allowedChats}]`
    );
    ctx.reply(
      'Функционал бота не доступен в этом чате\nПроизошла ошибка? Пиши @NikolayMagarin'
    );
  }
});

bot.start((ctx) => {
  ctx.reply('Уже начали!');
});

bot.catch((error, ctx) => {
  console.error(error, ctx);
});

registerMessageContent(bot);
handleCommands(bot);
handleMessages(bot);

export function launch() {
  bot.launch({
    dropPendingUpdates: true,
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
