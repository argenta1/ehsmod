import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYKyntd6o26RizcEEsgGV60-IW07jMdVc",
  authDomain: "ehs-modular.firebaseapp.com",
  projectId: "ehs-modular",
  storageBucket: "ehs-modular.appspot.com",
  messagingSenderId: "220666820168",
  appId: "1:220666820168:web:f66dbef2bc59d696e4ca7d",
  measurementId: "G-H5Y05Z4ZTW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };