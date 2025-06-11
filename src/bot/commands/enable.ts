import { Command, CommandHandler } from '.';
import { editChatSettings } from '../../db/shortcuts';

const handler: CommandHandler = async (ctx) => {
  await editChatSettings(ctx.chat.id, (settings) => {
    settings.bot.enabled = true;
  });

  ctx.react('👌');
};

export default { name: 'enable', handler } as Command;
