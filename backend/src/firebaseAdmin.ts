
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
}

const serviceAccount = JSON.parse(serviceAccountJson);

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key?.replace(/\\n/g, '\n'),
        }),
      })
    : getApps()[0];

export const adminDb = getFirestore(app);
