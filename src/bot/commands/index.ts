import { Telegraf } from 'telegraf';
import { AdditionalContext } from '../listenners/message/messageContent';
import me from './me';
import enable from './enable';
import disable from './disable';
import replyRate from './replyRate';

export type CommandHandler = Parameters<
  Telegraf<AdditionalContext>['command']
>[1];
export type Command = { name: string; handler: CommandHandler };

const commands: Command[] = [me, enable, disable, replyRate];

export function handleCommands(bot: Telegraf<AdditionalContext>) {
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
