import { Command, CommandHandler } from '.';
import { getChatSettings } from '../../db/shortcuts';

const handler: CommandHandler = async (ctx) => {
  const members = (await getChatSettings(ctx.chat.id))?.chat?.members;

  if (!members || members.length === 0) {
    ctx.react('💩');
    return;
  }

  ctx.reply(members.map((username) => `@${username}`).join(' '));

  ctx.react('👌');
};

export default { name: 'all', handler } as Command;
