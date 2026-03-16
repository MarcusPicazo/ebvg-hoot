import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Tus credenciales REALES de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALp913DgxuUx1i1fI8omTgpExbow5-3ng", 
  authDomain: "ebvghoot.firebaseapp.com",
  projectId: "ebvghoot",
  storageBucket: "ebvghoot.firebasestorage.app",
  messagingSenderId: "444839782994",
  appId: "1:444839782994:web:c8d7f11dee5477c2ee0d8b"
};

// Inicializamos los servicios
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const appId = firebaseConfig.appId;