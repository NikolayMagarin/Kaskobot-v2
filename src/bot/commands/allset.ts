import { Command, CommandHandler } from '.';
import { editChatSettings } from '../../db/shortcuts';

const handler: CommandHandler = async (ctx) => {
  if (ctx.args.length === 0) {
    ctx.react('💩');
    return;
  }

  editChatSettings(ctx.chat.id, (settings) => {
    settings.chat.members = [...ctx.args];
  });

  ctx.react('👌');
};

export default { name: 'allset', handler } as Command;
