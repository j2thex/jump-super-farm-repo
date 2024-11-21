'use client';
import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Market from './Market';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import UserManagement from './UserManagement';
import Farm from './Farm';
import Logs from './Logs';
import BottomNavigation from './BottomNavigation';
import Swap from './Swap';
import Referrals from './Referrals';
import { GameState, Platform, Bonus, bonuses } from '../types/game';

interface Crop {
  slot: number;
  type: string;
  plantedAt: number;
  stage: number;
}

const getTelegramUserName = (addLog: (message: string) => void): string | null => {
  try {
    addLog('Checking Telegram integration...');
    console.log('Window.Telegram:', window.Telegram);
    console.log('WebApp:', window.Telegram?.WebApp);
    
    if (window.Telegram?.WebApp) {
      addLog('Found Telegram WebApp');
      const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
      console.log('User data:', user);
      
      if (user) {
        addLog(`Found Telegram user: ${user.first_name}`);
        return user.first_name;
      } else {
        addLog('No user data in WebApp');
      }
    } else {
      addLog('No Telegram WebApp found');
    }
    return null;
  } catch (error) {
    console.error('Telegram detection error:', error);
    addLog(`Error getting Telegram user: ${error}`);
    return null;
  }
};

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('BONUS_SELECT');
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
  const [silver, setSilver] = useState(10);
  const [gold, setGold] = useState(0);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasGoldField, setHasGoldField] = useState(false);
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState<{
    name: string;
    platform: Platform;
    id?: string;
    telegramId?: number;
  }>({
    name: 'Web surfer',
    platform: 'web'
  });

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  }, []);

  const setCropsCallback = useCallback((crops: Crop[]) => {
    setCrops(crops);
  }, []);

  // Single useEffect for initial setup
  useEffect(() => {
    const telegramName = getTelegramUserName(addLog);
    const existingTelegramId = Cookies.get('telegramId');

    if (telegramName) {
      setUserInfo({
        name: telegramName,
        platform: 'telegram',
        id: existingTelegramId
      });
    } else if (existingTelegramId) {
      // If we have a Telegram ID but no WebApp, still treat as Telegram user
      const storedName = Cookies.get('userName') || 'Telegram User';
      setUserInfo({
        name: storedName,
        platform: 'telegram',
        id: existingTelegramId
      });
    } else {
      setUserInfo({
        name: 'Web surfer',
        platform: 'web'
      });
    }
  }, [addLog]);

  const handleBonusSelect = async (bonus: Bonus) => {
    try {
      // Update Firestore
      if (userInfo.id) {
        const userRef = doc(db, 'users', userInfo.id);
        await setDoc(userRef, {
          hasSelectedCharacter: true,
          selectedBonus: bonus.name
        }, { merge: true }); // Use merge to only update these fields
      }

      setSelectedBonus(bonus);
      setGameState('FARM');
      addLog(`Selected bonus: ${bonus.name}`);
    } catch (error) {
      addLog(`Error saving bonus selection: ${(error as Error).message}`);
    }
  };

  return (
    <Container>
      <UserManagement 
        setUserInfo={setUserInfo}
        setSilver={setSilver}
        setGold={setGold}
        setCrops={setCropsCallback}
        addLog={addLog}
        setGameState={setGameState}
        setSelectedBonus={setSelectedBonus}
        setUserId={setUserId}
        setHasGoldField={setHasGoldField}
      />
      {gameState === 'BONUS_SELECT' && (
        <BonusSelect>
          {userInfo.platform === 'telegram' && (
            <TelegramInfo>
              <UserIcon>👤</UserIcon>
              <UserName>{userInfo.name}</UserName>
              {userInfo.telegramId && (
                <TelegramId>ID: {userInfo.telegramId}</TelegramId>
              )}
            </TelegramInfo>
          )}
          <h2>Select a Bonus</h2>
          {bonuses.map(bonus => (
            <BonusOption key={bonus.id} onClick={() => handleBonusSelect(bonus)}>
              <h3>{bonus.name}</h3>
              <p>{bonus.description}</p>
            </BonusOption>
          ))}
        </BonusSelect>
      )}

      {gameState === 'FARM' && (
        <Farm 
          silver={silver} 
          setSilver={setSilver} 
          gold={gold} 
          setGold={setGold} 
          crops={crops} 
          setCrops={setCropsCallback} 
          selectedBonus={selectedBonus}
          addLog={addLog}
          userId={userId}
          hasGoldField={hasGoldField}
          userName={userInfo.name}
          platform={userInfo.platform}
          telegramId={userInfo.telegramId?.toString() || ''}
        />
      )}

      {gameState === 'MARKET' && (
        <Market 
          gold={gold} 
          setGold={setGold}
          silver={silver}
          setSilver={setSilver}
          userId={userId}
          addLog={addLog}
        />
      )}

      {gameState === 'SWAP' && (
        <Swap 
          gold={gold} 
          setGold={setGold}
          addLog={addLog}
        />
      )}

      {gameState === 'REFERRALS' && (
        <Referrals 
          userId={userId}
          addLog={addLog}
        />
      )}

      {gameState !== 'BONUS_SELECT' && <BottomNavigation setGameState={setGameState} />}
      <Logs logs={logs} addLog={addLog} />
    </Container>
  );
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 80px;
  text-align: center;
  min-height: 100vh;
  position: relative;
  color: white;
`;

const BonusSelect = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
`;

const BonusOption = styled.div`
  border: 1px solid #4CAF50;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  cursor: pointer;
  width: 80%;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  h3 {
    color: white;
  }

  p {
    color: #ccc;
  }
`;

const TelegramInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const UserIcon = styled.span`
  font-size: 1.2em;
`;

const UserName = styled.span`
  font-weight: 500;
  color: white;
`;

const TelegramId = styled.span`
  color: #64B5F6;
  font-size: 0.9em;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
`;