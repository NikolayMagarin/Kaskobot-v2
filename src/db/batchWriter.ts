import admin from 'firebase-admin';

type WriteOperation = {
  collection: string;
  docId: string;
  data: any;
};

const writeQueue = new Map<string, WriteOperation>();
const BATCH_INTERVAL = 10_000; // every 10 seconds
const MAX_BATCH_SIZE = 500;

export function queueWrite(collection: string, docId: string, data: any) {
  const key = `${collection}/${docId}`;
  writeQueue.set(key, { collection, docId, data });
}

setInterval(async () => {
  if (writeQueue.size === 0) return;

  const batch = admin.firestore().batch();
  const operations = Array.from(writeQueue.values()).slice(0, MAX_BATCH_SIZE);

  operations.forEach((op) => {
    const key = `${op.collection}/${op.docId}`;
    writeQueue.delete(key);
  });

  for (const op of operations) {
    const ref = admin.firestore().collection(op.collection).doc(op.docId);
    batch.set(ref, op.data, { merge: true });
  }

  try {
    await batch.commit();
    console.log(`[Firestore] ${operations.length} writes committed`);
  } catch (err) {
    console.error('[Firestore] Batch write failed:', err);
  }
}, BATCH_INTERVAL);
