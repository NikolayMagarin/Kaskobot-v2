import { Telegraf } from 'telegraf';
import { AdditionalContext } from '../listenners/message/messageContent';
import me from './me';
import enable from './enable';
import disable from './disable';
import replyRate from './replyRate';
import _delete from './delete';
import meme from './meme';
import clear from './clear';
import allset from './allset';
import all from './all';

export type CommandHandler = Parameters<
  Telegraf<AdditionalContext>['command']
>[1];
export type Command = { name: string; handler: CommandHandler };

export function handleCommands(bot: Telegraf<AdditionalContext>) {
  const commands: Command[] = [
    me,
    enable,
    disable,
    replyRate,
    _delete,
    meme,
    clear,
    allset,
    all,
  ];

  commands.forEach((command) => {
    bot.command(command.name, command.handler);
  });

  bot.on('message', (ctx, next) => {
    if (ctx.content.text?.[0] === '/') {
      ctx.react('💩');
    } else {
      next();
    }
  });
}
