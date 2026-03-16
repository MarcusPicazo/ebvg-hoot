// src/hooks/useKahoots.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage, appId } from '../config/firebase';

export const useKahoots = (user) => {
  const [customQuizzes, setCustomQuizzes] = useState([]);

  useEffect(() => {
    if (!user || !db) return;
    
    const kahootsRef = collection(db, 'artifacts', appId, 'public', 'data', 'kahoots');
    const unsubscribe = onSnapshot(kahootsRef, (snapshot) => {
      const loadedQuizzes = [];
      snapshot.forEach((docSnap) => {
        loadedQuizzes.push({ ...docSnap.data(), isCustom: true, dbId: docSnap.id });
      });
      loadedQuizzes.sort((a, b) => b.createdAt - a.createdAt);
      setCustomQuizzes(loadedQuizzes);
    }, (error) => {
      console.error("Firestore error:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const saveKahoot = async (newQuizData) => {
    const quizId = Date.now().toString();
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'kahoots', quizId);
    
    await setDoc(docRef, {
      ...newQuizData,
      id: quizId,
      color: 'bg-indigo-500',
      creatorId: user.uid,
      createdAt: Date.now()
    });
  };

  const deleteKahoot = async (quiz) => {
    // 1. Borrar imágenes de Storage asociadas
    if (quiz.questions && quiz.questions.length > 0) {
      for (const q of quiz.questions) {
        if (q.imageUrl && q.imageUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const imageRef = ref(storage, q.imageUrl);
            await deleteObject(imageRef);
          } catch (imgError) {
            console.error("Error al eliminar la imagen de Storage:", imgError);
          }
        }
      }
    }
    // 2. Borrar documento de Firestore
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'kahoots', quiz.dbId));
  };

  return { customQuizzes, saveKahoot, deleteKahoot };
};