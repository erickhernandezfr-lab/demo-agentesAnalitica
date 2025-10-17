
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator, Functions } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";

// Helper function to return environment variables or a mock value if not present
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    // Return a mock value or an empty string to prevent build failure
    console.warn(`Missing environment variable: ${key}. Using a mock value.`);
    return "MOCK_" + key;
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
// This will attempt to initialize Firebase with mock values if env vars are missing.
let app: FirebaseApp;
try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
    console.error("Error initializing Firebase app with provided configuration. This is expected if env vars are missing for a mock demo.", e);
    // As a fallback, create a dummy app object if initialization fails, to prevent further errors.
    // In a real scenario, you'd handle this more robustly or ensure env vars are always present.
    app = {} as FirebaseApp; // This is a minimalist mock, further methods would need to be mocked if called
}

// Only attempt to get Firestore and Functions if the app was successfully initialized
const firestore: Firestore = app && 'name' in app ? getFirestore(app) : ({} as Firestore);
const functions: Functions = app && 'name' in app ? getFunctions(app, 'us-central1') : ({} as Functions);

if (process.env.NODE_ENV === 'development') {
    console.log("Development mode: Connecting to emulators");
    try {
        if (firestore && (firestore as any)._emulatorOrigin === undefined) {
            connectFirestoreEmulator(firestore, 'localhost', 8080);
        }
        if (functions && (functions as any)._emulatorOrigin === undefined) {
            connectFunctionsEmulator(functions, 'localhost', 5001);
        }
    } catch (e) {
        console.error("Error connecting to emulators. Have you started them with 'firebase emulators:start'?", e);
    }
}

export { app, firestore, functions };
