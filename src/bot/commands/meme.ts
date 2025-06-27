import { Command, CommandHandler } from '.';
import fetch from 'node-fetch';
import { config } from '../../config';

let memeQueue: string[] = [];

if (config.env === 'prod') loadInitialMemes();

const handler: CommandHandler = async (ctx) => {
  await loadInitialMemes();

  if (memeQueue.length < 10) {
    loadMemes(2);
  }

  const memeLink = memeQueue.shift();
  if (memeLink) {
    ctx.replyWithPhoto(memeLink);
  }
};

/** 1 chunk = 5 memes (ussually) */
async function loadMemes(chunkQuantity = 1) {
  for (let i = 0; i < chunkQuantity; i++) {
    try {
      const res = await fetch('https://www.memify.ru/highfive/').then((r) =>
        r.text()
      );

      const matches = res.matchAll(
        /src="https:\/\/www\.vcdn\.memify\.ru\/media\/.{10,30}\/\d{5,10}\/.{5,30}\.jpg"/g
      );
      const links = [...matches]
        .map((match) => match[0])
        .map((link) => link.slice(5, link.length - 1));
      memeQueue.push(...links);
    } catch (error) {
      console.error(error);
    }
  }
}

async function loadInitialMemes() {
  if (memeQueue.length > 0) return;
  await loadMemes(2);
}

export default { name: 'meme', handler } as Command;
