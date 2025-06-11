import { Telegram } from 'telegraf';
import { config } from '../config';

export const tg = new Telegram(config.telegramBotToken);
