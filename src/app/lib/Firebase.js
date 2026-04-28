import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth,GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore"



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuNNl0E2wZxfFoTxYAQFd2i5xpcKwdQG8",
  authDomain: "typing-speed-f1148.firebaseapp.com",
  projectId: "typing-speed-f1148",
  storageBucket: "typing-speed-f1148.firebasestorage.app",
  messagingSenderId: "189200060094",
  appId: "1:189200060094:web:bb51be8fec8408ea4018ef"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const Auth = getAuth(app);
export const db = getFirestore(app);
export const Provider   = new GoogleAuthProvider()
export const rtdb = getDatabase(app)