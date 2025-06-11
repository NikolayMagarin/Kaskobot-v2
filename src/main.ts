import { launch } from './bot/bot';
import { loadStartupConfigs } from './db/configLoader';
import { server } from './server';
import { ping } from './server/ping';

async function main() {
  await loadStartupConfigs();

  launch();

  server.listen(8080, ping);
}

main().catch(console.error);
