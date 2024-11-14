import { useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

const UserManagement = ({ setUserId, setSilver, setGold, setCrops, addLog }) => {
  useEffect(() => {
    const loadUser = async () => {
      try {
        const telegramId = Cookies.get('telegramId');
        const webUserId = Cookies.get('webUserId');

        if (!telegramId && !webUserId) {
          const newWebUserId = uuidv4();
          Cookies.set('webUserId', newWebUserId);
          setUserId(newWebUserId);
          addLog(`Created new web user ID: ${newWebUserId}`);
        } else {
          const idToUse = telegramId || webUserId;
          setUserId(idToUse);
          addLog(`Using user ID: ${idToUse}`);
        }

        const userRef = doc(db, 'users', setUserId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          addLog('Creating new user...');
          const newUserData = {
            userId: setUserId,
            silver: 10,
            gold: 0,
            crops: [],
            hasSelectedCharacter: false
          };
          await setDoc(userRef, newUserData);
        } else {
          const userData = userDoc.data();
          addLog('Found existing user');
          
          setSilver(typeof userData.silver === 'number' ? userData.silver : 10);
          setGold(typeof userData.gold === 'number' ? userData.gold : 0);
          if (Array.isArray(userData.crops)) {
            const loadedCrops = userData.crops.map(crop => ({
              ...crop,
              plantedAt: Number(crop.plantedAt),
              stage: Number(crop.stage)
            }));
            setCrops(loadedCrops);
            addLog(`Loaded ${loadedCrops.length} crops`);
          }
        }
      } catch (error) {
        addLog(`Error loading user: ${error.message}`);
      }
    };

    loadUser();
  }, [setUserId, setSilver, setGold, setCrops, addLog]);

  return null; // This component does not render anything
};

export default UserManagement; 