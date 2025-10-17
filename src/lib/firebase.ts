
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator, Functions } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";

// Helper function to throw a clear error for missing environment variables.
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: getRequiredEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getRequiredEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getRequiredEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

// Singleton pattern to prevent multiple initializations
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const firestore: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app, 'us-central1');

if (process.env.NODE_ENV === 'development') {
    console.log("Development mode: Connecting to emulators");
    try {
        if (!(firestore as any)._emulatorOrigin) {
            connectFirestoreEmulator(firestore, 'localhost', 8080);
        }
        if (!(functions as any)._emulatorOrigin) {
            connectFunctionsEmulator(functions, 'localhost', 5001);
        }
    } catch (e) {
        console.error("Error connecting to emulators. Have you started them with 'firebase emulators:start'?", e);
    }
}

export { app, firestore, functions };
