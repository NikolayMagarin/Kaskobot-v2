import { Command, CommandHandler } from '.';
import { editChatSettings } from '../../db/shortcuts';

const handler: CommandHandler = async (ctx) => {
  await editChatSettings(ctx.chat.id, (settings) => {
    settings.bot.enabled = false;
  });

  ctx.react('👌');
};

export default { name: 'disable', handler } as Command;
