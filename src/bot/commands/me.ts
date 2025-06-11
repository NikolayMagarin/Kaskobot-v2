import { Command, CommandHandler } from '.';
import { editChatSettings } from '../../db/shortcuts';

const handler: CommandHandler = async (ctx) => {
  const userId = ctx.message.from.id;
  const chatId = ctx.chat.id;
  const preferredName = ctx.args.join(' ').trim();

  if (preferredName.length < 1) {
    ctx.react('💩');
    return;
  }

  await editChatSettings(chatId, (settings) => {
    settings.bot.preferredUserNames[userId] = preferredName;
  });

  ctx.react('👌');
};

export default { name: 'me', handler } as Command;
