import admin from 'firebase-admin';
import { get, set } from './cacheManager';
import { queueWrite } from './batchWriter';
import { config } from '../config';
import { DocumentQuery } from './collections';

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: config.firebaseClientEmail,
    privateKey: config.firebasePrivateKey,
    projectId: config.firebaseProjectId,
  }),
});

const db = admin.firestore();

export async function getDocument<
  C extends DocumentQuery['collection'],
  D extends Extract<DocumentQuery, { collection: C }>['docId'],
  T extends
    | Extract<DocumentQuery, { collection: C; docId: D }>['data']
    | Extract<DocumentQuery, { collection: C }>['data']
>(
  collection: C,
  docId: D,
  options = { force: false, persistent: false }
): Promise<T | null> {
  const cacheKey = `${collection}/${docId}`;
  if (!options.force) {
    const cached = get<T>(cacheKey);
    if (cached) return cached;
  }

  const snapshot = await db.collection(collection).doc(docId).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() as T;
  set<T>(cacheKey, data, options.persistent);

  console.log(`[Firestore] Loaded: ${cacheKey}`);
  return data;
}

export function setDocument<
  C extends DocumentQuery['collection'],
  D extends Extract<DocumentQuery, { collection: C }>['docId'],
  T extends
    | Extract<DocumentQuery, { collection: C; docId: D }>['data']
    | Extract<DocumentQuery, { collection: C }>['data']
>(collection: C, docId: D, data: T, options = { persistent: false }) {
  const cacheKey = `${collection}/${docId}`;
  set<T>(cacheKey, data, options.persistent);
  queueWrite(collection, docId, data);
}
