import admin from 'firebase-admin';

type WriteOperation = {
  collection: string;
  docId: string;
  data: any;
};

const writeQueue: WriteOperation[] = [];
const BATCH_INTERVAL = 10_000; // every 10 seconds
const MAX_BATCH_SIZE = 500;

export function queueWrite(collection: string, docId: string, data: any) {
  writeQueue.push({ collection, docId, data });
}

setInterval(async () => {
  if (writeQueue.length === 0) return;

  const batch = admin.firestore().batch();
  const operations = writeQueue.splice(0, MAX_BATCH_SIZE);

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
