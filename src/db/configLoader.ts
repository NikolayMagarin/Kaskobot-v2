import { config } from '../config';
import { DocumentQuery } from './collections';
import { getDocument } from './firestore';

type ConfigKey = Extract<DocumentQuery, { collection: 'configs' }>['docId'];

const configKeysDefault: ConfigKey[] = ['bot'];

export async function loadStartupConfigs(
  customConfigKeys: ConfigKey[] = []
): Promise<void> {
  const configKeys = configKeysDefault.concat(customConfigKeys);
  for (const key of configKeys) {
    const loadedConfig = await getDocument('configs', key, {
      force: true,
      persistent: true,
    });
  }
}
