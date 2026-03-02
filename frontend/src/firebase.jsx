import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAvEjpoO-0bNTb8IuHU0wiVqkTxZuyH9Y",
  authDomain: "khammaghani-restaurent.firebaseapp.com",
  projectId: "khammaghani-restaurent",
  appId: "khammaghani-restaurent.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();