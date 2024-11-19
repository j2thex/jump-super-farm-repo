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

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  is_premium?: boolean;
}

interface LoggerFunction {
  (message: string): void;
}

const getTelegramUserInfo = (logger: LoggerFunction): TelegramUser | null => {
  try {
    console.log('Checking Telegram WebApp:', window.Telegram?.WebApp);
    console.log('InitData:', window.Telegram?.WebApp?.initDataUnsafe);
    
    if (window.Telegram?.WebApp) {
      const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
      console.log('Telegram user data:', user);
      
      if (user) {
        logger(`Found Telegram user: ${user.first_name} (ID: ${user.id})`);
        return user;
      } else {
        logger('No Telegram user data found in WebApp');
      }
    } else {
      logger('Telegram WebApp not found');
    }
    return null;
  } catch (error) {
    console.error('Error getting Telegram user info:', error);
    logger(`Error getting Telegram user: ${error}`);
    return null;
  }
};

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
        const existingTelegramId = Cookies.get('telegramId');
        addLog(`Current cookies - telegramId: ${existingTelegramId}, webUserId: ${Cookies.get('webUserId')}`);
        
        const telegramUser = getTelegramUserInfo(addLog);
        addLog(`Telegram user detection result: ${telegramUser ? 'Found' : 'Not found'}`);
        
        // If we have an existing Telegram ID but WebApp isn't available, keep using it
        if (existingTelegramId && !telegramUser) {
          addLog('Using existing Telegram ID');
          userId = existingTelegramId;
        } else if (!userId) {
          // Only create new ID if we don't have any existing ID
          if (telegramUser) {
            userId = `tg-${telegramUser.id}`;
            Cookies.set('telegramId', userId, { expires: 365 });
            addLog('Generated new Telegram user ID');
          } else {
            userId = `web-${uuidv4()}`;
            Cookies.set('webUserId', userId, { expires: 365 });
            addLog('Generated new web user ID');
          }
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
            hasGoldField: false,
            createdAt: Date.now(),
            // Add Telegram user info if available
            ...(telegramUser ? {
              telegramId: telegramUser.id,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name || '',
              username: telegramUser.username || '',
              isPremium: telegramUser.is_premium || false,
              platform: 'telegram'
            } : {
              platform: 'web'
            })
          };
          await setDoc(userRef, newUserData);
          setSilver(10);
          setGold(0);
          setCrops([]);

          // Log user creation with platform info
          addLog(`Created new ${telegramUser ? 'Telegram' : 'web'} user${telegramUser ? ` (${telegramUser.first_name})` : ''}`);
        } else {
          const userData = userDoc.data();
          setSilver(typeof userData.silver === 'number' ? userData.silver : 10);
          setGold(typeof userData.gold === 'number' ? userData.gold : 0);
          setHasGoldField(!!userData.hasGoldField);
          
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

          // Update Telegram premium status if it changed
          if (telegramUser && userData.isPremium !== telegramUser.is_premium) {
            await setDoc(userRef, {
              isPremium: telegramUser.is_premium
            }, { merge: true });
            addLog(`Premium status updated: ${telegramUser.is_premium ? 'Premium' : 'Regular'} user`);
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