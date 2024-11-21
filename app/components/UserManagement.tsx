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

const waitForTelegramWebApp = async (logger: LoggerFunction, maxAttempts = 5): Promise<TelegramUser | null> => {
  for (let i = 0; i < maxAttempts; i++) {
    logger(`📱 Checking Telegram WebApp (attempt ${i + 1})`);
    
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      logger(`👋 Welcome, ${user.first_name}! (ID: ${user.id})`);
      if (user.username) logger(`👨‍💻 @${user.username}`);
      if (user.is_premium) logger('⭐ Premium user');
      return user;
    }

    // Check if we're in Telegram environment
    const isTelegramEnvironment = window.location.href.includes('t.me') || 
                                /Telegram/i.test(navigator.userAgent) ||
                                !!window.Telegram;

    if (isTelegramEnvironment) {
      logger('📱 Waiting for Telegram WebApp...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }

    break;
  }
  return null;
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
        
        // Try to get Telegram user data
        const telegramUser = await waitForTelegramWebApp(addLog);
        
        // Create or get user ID
        if (!userId) {
          if (telegramUser) {
            // Use actual Telegram ID
            userId = telegramUser.id.toString();
            addLog(`✨ Created new Telegram user with ID: ${userId}`);
          } else if (isTelegramEnvironment) {
            // Try to get ID from URL parameters
            const startParam = urlParams.get('tgWebAppStartParam');
            if (startParam?.startsWith('user')) {
              userId = startParam.replace('user', '');
              addLog(`✨ Using Telegram ID from URL: ${userId}`);
            } else {
              // If we can't get the ID, use web user format
              userId = `web-${uuidv4()}`;
              addLog('✨ Created new web user (fallback)');
            }
          } else {
            // Definitely a web user
            userId = `web-${uuidv4()}`;
            addLog('✨ Created new web user');
          }

          // Set appropriate cookie
          if (isTelegramEnvironment || telegramUser) {
            Cookies.set('telegramId', userId, { expires: 365 });
          } else {
            Cookies.set('webUserId', userId, { expires: 365 });
          }
        }

        setUserId(userId);
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          addLog('📝 Creating new user profile...');
          const newUserData = {
            userId,
            silver: 10,
            gold: 0,
            crops: [],
            hasSelectedCharacter: false,
            hasGoldField: false,
            createdAt: Date.now(),
            platform: isTelegramEnvironment ? 'telegram' : 'web',
            // Add Telegram user info if available
            ...(telegramUser && {
              telegramId: telegramUser.id,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name || '',
              username: telegramUser.username || '',
              isPremium: telegramUser.is_premium || false,
              language: window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || 'en'
            })
          };

          await setDoc(userRef, newUserData);
          addLog('✅ User profile created successfully');

          setSilver(10);
          setGold(0);
          setCrops([]);

          setUserInfo({
            name: telegramUser?.first_name || 'User',
            platform: isTelegramEnvironment ? 'telegram' : 'web',
            id: userId,
            telegramId: telegramUser?.id
          });
        } else {
          const userData = userDoc.data();
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