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
        const telegramId = Cookies.get('telegramId');
        const webUserId = Cookies.get('webUserId');

        let userId: string; // Declare userId variable

        if (!telegramId && !webUserId) {
          const newWebUserId = uuidv4();
          Cookies.set('webUserId', newWebUserId);
          userId = newWebUserId; // Assign new user ID
          setUserId(userId);
          addLog(`Created new web user ID: ${newWebUserId}`);
        } else {
          userId = telegramId || webUserId || ''; // Provide a fallback to an empty string
          setUserId(userId);
          addLog(`Using user ID: ${userId}`);
        }

        const userRef = doc(db, 'users', userId); // Use userId here
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          addLog('Creating new user...');
          const newUserData = {
            userId: userId,
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
        // Type assertion to Error
        addLog(`Error loading user: ${(error as Error).message}`);
      }
    };

    loadUser();
  }, [setUserId, setSilver, setGold, setCrops, addLog]);

  return null; // This component does not render anything
};

export default UserManagement; 