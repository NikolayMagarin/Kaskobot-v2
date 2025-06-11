import { Command, CommandHandler } from '.';
import { getBotConfig } from '../../db/shortcuts';

const handler: CommandHandler = async (ctx) => {
  if (
    ctx.message.reply_to_message &&
    ctx.message.reply_to_message.chat.id === ctx.message.chat.id &&
    ctx.message.reply_to_message.from &&
    ctx.message.reply_to_message.from.id === (await getBotConfig())?.botId
  ) {
    try {
      await ctx.deleteMessage(ctx.message.reply_to_message.message_id);
      try {
        await ctx.deleteMessage(ctx.message.message_id);
      } catch {
        ctx.react('👌');
      }
    } catch {
      ctx.react('💩');
    }
  } else {
    ctx.react('💩');
  }
};

export default { name: 'delete', handler } as Command;
