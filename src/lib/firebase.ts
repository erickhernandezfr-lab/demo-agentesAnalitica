
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator, Functions } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Singleton pattern to prevent multiple initializations
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const firestore: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app, 'us-central1');

if (process.env.NODE_ENV === 'development') {
    console.log("Development mode: Connecting to emulators");
    try {
        // Check if emulators are already running to avoid re-connecting on HMR
        // The _emulatorOrigin property is an internal detail, but useful here.
        // A more public way is not readily available in the SDK.
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
