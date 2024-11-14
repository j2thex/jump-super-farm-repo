import { useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

// Define the props interface
interface UserManagementProps {
  setUserId: (id: string) => void; // Define setUserId function type
  setSilver: (silver: number) => void; // Define setSilver function type
  setGold: (gold: number) => void; // Define setGold function type
  setCrops: (crops: Crop[]) => void; // Define setCrops function type
  addLog: (message: string) => void; // Define addLog function type
}

interface Crop {
  slot: number;
  type: string;
  plantedAt: number;
  stage: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ setUserId, setSilver, setGold, setCrops, addLog }) => {
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = Cookies.get('telegramId') || Cookies.get('webUserId');
        
        if (userId) {
          setUserId(userId);
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            addLog('Creating new user...');
            const newUserData = {
              userId,
              silver: 10,
              gold: 0,
              crops: [],
              hasSelectedCharacter: false
            };
            await setDoc(userRef, newUserData);
          } else {
            // Load existing user data
            const userData = userDoc.data();
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
        }
      } catch (error) {
        addLog(`Error loading user: ${(error as Error).message}`);
      }
    };

    loadUser();
  }, [setUserId, setSilver, setGold, setCrops, addLog]);

  return null;
};

export default UserManagement; 