import { useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import { GameState, Platform, Bonus, bonuses } from '../types/game';

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
  setUserInfo: (info: { 
    name: string; 
    platform: Platform; 
    id?: string;
    telegramId?: number;
  }) => void;
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
  language_code?: string;
}

interface LoggerFunction {
  (message: string): void;
}

interface UserData {
  userId: string;
  silver: number;
  gold: number;
  crops: Crop[];
  hasSelectedCharacter: boolean;
  hasGoldField: boolean;
  platform: Platform;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  isPremium?: boolean;
  language?: string;
  createdAt: number;
  selectedBonus?: string;
}

const waitForTelegramWebApp = async (logger: LoggerFunction): Promise<{ user: TelegramUser | null; available: boolean }> => {
  try {
    logger('📱 Initializing Telegram WebApp...');
    
    // Wait for WebApp to be ready
    for (let i = 0; i < 10; i++) {  // Increased attempts
      if (window.Telegram?.WebApp) {
        if (window.Telegram.WebApp.initDataUnsafe?.user) {
          const user = window.Telegram.WebApp.initDataUnsafe.user;
          logger(`👤 Found Telegram user: ${user.first_name}`);
          logger(`🆔 ID: ${user.id}`);
          if (user.username) logger(`👨‍💻 @${user.username}`);
          if (user.is_premium) logger('⭐ Premium user');
          return { user, available: true };
        }
        
        // If WebApp exists but no user data yet, wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      logger(`Waiting for Telegram WebApp (attempt ${i + 1}/10)...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Check if we're in Telegram environment
    const isTelegramEnvironment = window.location.href.includes('t.me') || 
                               /Telegram/i.test(navigator.userAgent) ||
                               !!window.Telegram;

    if (isTelegramEnvironment) {
      logger('📱 In Telegram environment but WebApp not initialized');
      return { user: null, available: true };
    }

    logger('🌐 Web environment detected');
    return { user: null, available: false };
  } catch (error) {
    logger(`❌ Error initializing WebApp: ${error}`);
    return { user: null, available: false };
  }
};

const extractTelegramId = (url: string): string | null => {
  try {
    const startMatch = url.match(/\?start=user(\d+)/);
    if (startMatch) return startMatch[1];
    
    const tgWebAppStartParam = new URLSearchParams(url.split('?')[1]).get('tgWebAppStartParam');
    if (tgWebAppStartParam?.startsWith('user')) return tgWebAppStartParam.replace('user', '');
    
    return null;
  } catch {
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
  setHasGoldField, 
  setUserInfo
}) => {
  useEffect(() => {
    let isLoading = false;

    const loadUser = async () => {
      if (isLoading) return;
      isLoading = true;

      try {
        // First check if we're in Telegram environment
        const urlParams = new URLSearchParams(window.location.search);
        const isTelegramEnvironment = window.location.href.includes('t.me') || 
                                     /Telegram/i.test(navigator.userAgent) ||
                                     !!window.Telegram ||
                                     urlParams.get('tgWebAppStartParam') || 
                                     urlParams.get('tgWebAppData');

        let userId = Cookies.get('telegramId') || Cookies.get('webUserId');
        
        // Explicitly type telegramUser
        const { user: telegramUser, available } = await waitForTelegramWebApp(addLog);
        
        if (telegramUser) {
          // Use Telegram ID as user ID
          userId = telegramUser.id.toString();
          
          // Save to Firestore
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            addLog('📝 Creating new user profile...');
            const newUserData = {
              userId,
              telegramId: telegramUser.id,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name || '',
              username: telegramUser.username || '',
              isPremium: telegramUser.is_premium || false,
              language: window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || 'en',
              platform: 'telegram',
              silver: 10,
              gold: 0,
              crops: [],
              hasSelectedCharacter: false,
              hasGoldField: false,
              createdAt: Date.now()
            };

            await setDoc(userRef, newUserData);
            addLog('✅ User profile created successfully');

            setSilver(10);
            setGold(0);
            setCrops([]);

            setUserInfo({
              name: telegramUser.first_name,
              platform: 'telegram',
              id: userId,
              telegramId: telegramUser.id
            });

            Cookies.set('telegramId', userId, { expires: 365 });
          } else {
            const userData = userDoc.data() as UserData;
            setSilver(typeof userData.silver === 'number' ? userData.silver : 10);
            setGold(typeof userData.gold === 'number' ? userData.gold : 0);
            setHasGoldField(!!userData.hasGoldField);
            
            // Handle character selection state
            if (userData.hasSelectedCharacter) {
              setGameState('FARM');
              const savedBonus = bonuses.find((b: Bonus) => b.name === userData.selectedBonus);
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

            // Set user info from stored data
            if (userData.platform === 'telegram') {
              setUserInfo({
                name: userData.firstName || 'Telegram User',
                platform: 'telegram',
                id: userId,
                telegramId: userData.telegramId
              });
            }
          }
        } else {
          // Create web user
          const userId = `web-${uuidv4()}`;
          
          // Save to Firestore
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            addLog('📝 Creating new user profile...');
            const newUserData = {
              userId,
              platform: 'web',
              silver: 10,
              gold: 0,
              crops: [],
              hasSelectedCharacter: false,
              hasGoldField: false,
              createdAt: Date.now()
            };

            await setDoc(userRef, newUserData);
            addLog('✅ User profile created successfully');

            setSilver(10);
            setGold(0);
            setCrops([]);

            setUserInfo({
              name: 'User',
              platform: 'web',
              id: userId
            });

            Cookies.set('webUserId', userId, { expires: 365 });
          } else {
            const userData = userDoc.data() as UserData;
            setSilver(typeof userData.silver === 'number' ? userData.silver : 10);
            setGold(typeof userData.gold === 'number' ? userData.gold : 0);
            setHasGoldField(!!userData.hasGoldField);
            
            // Handle character selection state
            if (userData.hasSelectedCharacter) {
              setGameState('FARM');
              const savedBonus = bonuses.find((b: Bonus) => b.name === userData.selectedBonus);
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

            // Set user info from stored data
            setUserInfo({
              name: 'User',
              platform: 'web',
              id: userId
            });
          }
        }
      } catch (error) {
        addLog(`❌ Error: ${error}`);
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
    setHasGoldField,
    setUserInfo
  ]);

  return null;
};

export default UserManagement; 