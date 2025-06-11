import { launch } from './bot/bot';
import { loadStartupConfigs } from './db/configLoader';

async function main() {
  await loadStartupConfigs();

  launch();
}

main().catch(console.error);
