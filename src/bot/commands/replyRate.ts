import { Command, CommandHandler } from '.';
import { editChatSettings } from '../../db/shortcuts';

const handler: CommandHandler = async (ctx) => {
  const chatId = ctx.chat.id;
  const valueStr = ctx.args[0]?.trim();
  let value: number;

  if (!/^\d+(\.\d+)?$/.test(valueStr)) {
    ctx.react('💩');
    return;
  }

  try {
    value = parseFloat(valueStr);
  } catch {
    ctx.react('💩');
    return;
  }

  if (Number.isNaN(value) || value < 0 || value > 1) {
    ctx.react('💩');
    return;
  }

  await editChatSettings(chatId, (settings) => {
    settings.bot.triggerReplyChance = value;
  });

  ctx.react('👌');
};

export default { name: 'replyrate', handler } as Command;
