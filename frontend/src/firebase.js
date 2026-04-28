import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9st39ZSFU42fWGoG6zzHxLHLQi1g3BqY",
  authDomain: "neylesek-187eb.firebaseapp.com",
  projectId: "neylesek-187eb",
  storageBucket: "neylesek-187eb.firebasestorage.app",
  messagingSenderId: "569546608169",
  appId: "1:569546608169:web:183adbeb301b3b0d701638"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);