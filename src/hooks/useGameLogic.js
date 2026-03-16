import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export const useGameLogic = (hostPin) => {
  const [gameState, setGameState] = useState(null);
  const [playersList, setPlayersList] = useState([]);

  useEffect(() => {
    if (!hostPin || !db) return;
    
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'partidas_activas', hostPin);
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGameState(data);
        
        // Convertimos el map de jugadores a un Array para usarlo en la UI
        const pList = data.players ? Object.values(data.players) : [];
        setPlayersList(pList);
      } else {
        setGameState(null); // Indica que la sala se cerró
      }
    }, (error) => console.error("Error al escuchar la sala:", error));

    return () => unsubscribe();
  }, [hostPin]);

  return { gameState, playersList };
};