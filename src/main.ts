import { launch } from './bot/bot';
import { loadStartupConfigs } from './db/configLoader';
import { server } from './server';

async function main() {
  await loadStartupConfigs();

  launch();

  server.listen(8080);
}

main().catch(console.error);
