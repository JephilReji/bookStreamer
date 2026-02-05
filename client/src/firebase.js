import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxe83dYQ0qmJOvcYwH8V6InL5F-PfXFxQ",
  authDomain: "bookstreamer14.firebaseapp.com",
  projectId: "bookstreamer14",
  storageBucket: "bookstreamer14.firebasestorage.app",
  messagingSenderId: "801921906048",
  appId: "1:801921906048:web:0e932ca96ef226e3d67d65"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);