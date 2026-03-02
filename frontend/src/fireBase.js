import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAvEjpoO-0bNTb8IuHU0wiVqkTxZuyH9Y",
  authDomain: "khammaghani-restaurent.firebaseapp.com",
  projectId: "khammaghani-restaurent",
  storageBucket: "khammaghani-restaurent.firebasestorage.app",
  messagingSenderId: "475188469130",
  appId: "1:475188469130:web:1f48ca6cbb67a763e0fc73",
  measurementId: "G-Z749YZ6CSH",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
