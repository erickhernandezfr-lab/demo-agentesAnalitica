
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

let app: FirebaseApp;
let firestore: Firestore;
let functions: Functions;

// This prevents Firebase from being initialized more than once
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

firestore = getFirestore(app);
functions = getFunctions(app, 'us-central1');

if (process.env.NODE_ENV === 'development') {
    console.log("Development mode: Connecting to emulators");
    try {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch (e) {
        console.error("Error connecting to emulators. Have you started them with 'firebase emulators:start'?", e);
    }
}

export { app, firestore, functions };
