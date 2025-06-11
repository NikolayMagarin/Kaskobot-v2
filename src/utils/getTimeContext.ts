import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

export function getTimeContext(): string {
  const now = dayjs();
  const hour = now.hour();
  const month = now.month() + 1;
  const dayOfWeek = now.format('dddd');
  const date = now.format('YYYY-MM-DD, HH:mm:ss');

  let partOfDay = '';
  if (hour >= 6 && hour < 12) partOfDay = 'утро';
  else if (hour >= 12 && hour < 18) partOfDay = 'день';
  else if (hour >= 18 && hour < 23) partOfDay = 'вечер';
  else partOfDay = 'ночь';

  let season = '';
  if ([12, 1, 2].includes(month)) season = 'зима';
  else if ([3, 4, 5].includes(month)) season = 'весна';
  else if ([6, 7, 8].includes(month)) season = 'лето';
  else season = 'осень';

  return `Сейчас ${partOfDay}, ${season}, ${dayOfWeek}, ${date}`;
}
