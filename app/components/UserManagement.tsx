import { useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

// Import types and bonuses from Game
type GameState = 'BONUS_SELECT' | 'FARM' | 'MARKET' | 'SWAP' | 'REFERRALS';

interface Bonus {
  id: number;
  name: string;
  description: string;
}

const bonuses: Bonus[] = [
  { id: 1, name: 'Speed', description: 'Grow crops 20% faster' },
  { id: 2, name: 'More farms', description: '20% more farmland' },
  { id: 3, name: 'Higher price', description: '20% more profit' },
];

// Define the props interface
interface UserManagementProps {
  setUserId: (id: string) => void;
  setSilver: (silver: number) => void;
  setGold: (gold: number) => void;
  setCrops: (crops: Crop[]) => void;
  addLog: (message: string) => void;
  setGameState: (state: GameState) => void;
  setSelectedBonus: (bonus: Bonus | null) => void;
  setHasGoldField: (hasGoldField: boolean) => void;
}

interface Crop {
  slot: number;
  type: string;
  plantedAt: number;
  stage: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  setUserId, 
  setSilver, 
  setGold, 
  setCrops, 
  addLog, 
  setGameState, 
  setSelectedBonus, 
  setHasGoldField 
}) => {
  useEffect(() => {
    let isLoading = false;

    const loadUser = async () => {
      if (isLoading) return;
      isLoading = true;

      try {
        let userId = Cookies.get('telegramId') || Cookies.get('webUserId');
        
        // Create a new webUserId if none exists
        if (!userId) {
          userId = `web-${uuidv4()}`;
          Cookies.set('webUserId', userId, { expires: 365 });
          addLog('Generated new user ID');
        }

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
            hasSelectedCharacter: false,
            hasGoldField: false
          };
          await setDoc(userRef, newUserData);
          setSilver(10);
          setGold(0);
          setCrops([]);
        } else {
          const userData = userDoc.data();
          setSilver(typeof userData.silver === 'number' ? userData.silver : 10);
          setGold(typeof userData.gold === 'number' ? userData.gold : 0);
          
          // Handle character selection state
          if (userData.hasSelectedCharacter) {
            setGameState('FARM');
            const savedBonus = bonuses.find(b => b.name === userData.selectedBonus);
            if (savedBonus) {
              setSelectedBonus(savedBonus);
              if (Array.isArray(userData.crops)) {
                addLog(`Restored game with ${userData.crops.length} crops and ${savedBonus.name} bonus`);
              }
            }
          }

          if (Array.isArray(userData.crops)) {
            const loadedCrops = userData.crops.map(crop => ({
              ...crop,
              plantedAt: Number(crop.plantedAt),
              stage: Number(crop.stage)
            }));
            setCrops(loadedCrops);
          }
        }
      } catch (error) {
        addLog(`Error: ${(error as Error).message}`);
      } finally {
        isLoading = false;
      }
    };

    loadUser();

    return () => {
      isLoading = true;
    };
  }, [
    addLog,
    setCrops,
    setGameState,
    setGold,
    setSelectedBonus,
    setSilver,
    setUserId,
    setHasGoldField
  ]);

  return null;
};

export default UserManagement; 