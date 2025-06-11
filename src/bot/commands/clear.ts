import { Command, CommandHandler } from '.';
import { setChatHistory } from '../../db/shortcuts';

const handler: CommandHandler = async (ctx) => {
  setChatHistory(ctx.chat.id, { messages: [] });
  ctx.react('👌');
};

export default { name: 'clear', handler } as Command;
