import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ALARMA 1: Revisa si exportamos bien la configuración
    if (!auth) {
      alert("ERROR FATAL: 'auth' no está conectado. El problema está en tu archivo config/firebase.js");
      return;
    }

    const loginSilencioso = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        // ALARMA 2: Revisa si Firebase nos bloquea en la nube
        alert("ERROR DE FIREBASE: " + error.message);
      }
    };

    loginSilencioso();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return { user };
};