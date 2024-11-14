'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Market from './Market';
import React from 'react';

type GameState = 'CHARACTER_SELECT' | 'FARM' | 'MARKET';

type Character = {
  id: number;
  name: string;
  image: string;
};

type CropStage = 0 | 1 | 2 | 3 | 4 | 5;

type Crop = {
  slot: number;
  type: 'wheat';
  plantedAt: number;
  stage: CropStage;
};

const characters: Character[] = [
  { id: 1, name: 'Farmer John', image: '👨‍🌾' },
  { id: 2, name: 'Farmer Jane', image: '👩‍🌾' },
  { id: 3, name: 'Farmer Jack', image: '🧑‍🌾' },
];

// Add this helper function at the top level
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Define the getCropEmoji function
const getCropEmoji = (stage: CropStage) => {
  switch (stage) {
    case 0:
      return '🌱'; // Seedling
    case 1:
      return '🌿'; // Young plant
    case 2:
      return '🌾'; // Mature plant
    case 3:
      return '🌾'; // Ready for harvest
    case 4:
      return '🌾'; // Ready for harvest
    case 5:
      return '🌾'; // Ready for harvest
    default:
      return '🟫'; // Default for no crop
  }
};

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('CHARACTER_SELECT');
  const [userId, setUserId] = useState<string>('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [silver, setSilver] = useState(10);
  const [gold, setGold] = useState(0);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        
        // Get Telegram user ID
        const tgUser = WebApp.initDataUnsafe?.user;
        const telegramId = tgUser?.id?.toString();
        
        if (!telegramId) {
          addLog('No Telegram ID found');
          return;
        }

        addLog(`Using Telegram ID: ${telegramId}`);
        setUserId(telegramId);
        
        const userRef = doc(db, 'users', telegramId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          addLog('Creating new user...');
          const newUserData = {
            userId: telegramId,
            character: null,
            silver: 10,
            crops: [],
            hasSelectedCharacter: false
          };
          await setDoc(userRef, newUserData);
        } else {
          const userData = userDoc.data();
          addLog('Found existing user');
          
          if (userData.character) {
            setCharacter(userData.character);
            setSilver(typeof userData.silver === 'number' ? userData.silver : 10);
            if (Array.isArray(userData.crops)) {
              const loadedCrops = userData.crops.map(crop => ({
                ...crop,
                plantedAt: Number(crop.plantedAt),
                stage: Number(crop.stage) as CropStage
              }));
              setCrops(loadedCrops);
              addLog(`Loaded ${loadedCrops.length} crops`);
            }
            setGameState('FARM');
          }
        }

        WebApp.ready();
      } catch (error: any) {
        addLog(`Error: ${error.message}`);
      }
    };

    loadUser();
  }, []);

  const selectCharacter = (selected: Character) => {
    setCharacter(selected);
    setGameState('FARM');
    addLog(`Selected ${selected.name}`);
  };

  const exchangeSilverForGold = () => {
    if (silver >= 100) {
      const goldGained = Math.floor(silver / 100);
      setGold(prevGold => prevGold + goldGained);
      setSilver(prevSilver => prevSilver - goldGained * 100);
      addLog(`Exchanged ${goldGained * 100} silver for ${goldGained} gold`);
    } else {
      addLog('Not enough silver to exchange for gold');
    }
  };

  const purchaseCrop = (cropType: string) => {
    const cropCost = 10; // Define the cost of the crop in gold
    if (gold >= cropCost) {
      setGold(prevGold => prevGold - cropCost);
      addLog(`Purchased ${cropType} for ${cropCost} gold`);
      // Logic to add the crop to the user's inventory can be added here
    } else {
      addLog('Not enough gold to purchase this crop');
    }
  };

  const harvestCrop = (slot: number) => {
    const crop = crops.find(c => c.slot === slot);
    if (crop && crop.stage === 5) {
      addLog(`Harvesting crop from slot ${slot}`);
      
      const newCrops = crops.filter(c => c.slot !== slot);
      const newSilver = silver + 5; // Example reward for harvesting
      
      // Update state
      setCrops(newCrops);
      setSilver(newSilver);
      
      // Save using the new values directly
      addLog(`Harvested crop from slot ${slot}. New silver: ${newSilver}`);
    } else {
      addLog(`Cannot harvest slot ${slot}: ${!crop ? 'No crop' : 'Not ready'}`);
    }
  };

  const plantCrop = (slot: number) => {
    if (silver >= 2 && !crops.find(crop => crop.slot === slot)) {
      addLog(`Attempting to plant in slot ${slot}`);
      
      const newCrops: Crop[] = [...crops, {
        slot,
        type: 'wheat' as const,
        plantedAt: Date.now(),
        stage: 0 as CropStage
      }];
      
      // Update state
      setCrops(newCrops);
      setSilver(prev => prev - 2);
      
      // Save using the new crops array directly
      addLog(`Planted crop in slot ${slot}`);
    } else {
      addLog(`Cannot plant in slot ${slot}: ${silver < 2 ? 'Not enough silver' : 'Slot occupied'}`);
    }
  };

  return (
    <Container>
      {gameState === 'CHARACTER_SELECT' && (
        <CharacterSelect>
          <h2>Choose Your Character</h2>
          <CharacterList>
            {characters.map(char => (
              <CharacterCard 
                key={char.id}
                onClick={() => selectCharacter(char)}
              >
                <div>{char.image}</div>
                <div>{char.name}</div>
              </CharacterCard>
            ))}
          </CharacterList>
        </CharacterSelect>
      )}

      {gameState === 'FARM' && (
        <FarmScreen>
          <Header>
            <h2>Welcome, {character?.name}!</h2>
            <div>Silver: {silver}</div>
            <div>Gold: {gold}</div>
          </Header>
          <button onClick={exchangeSilverForGold}>Exchange Silver for Gold</button>
          <FarmGrid>
            {Array.from({ length: 6 }).map((_, index) => {
              const crop = crops.find(c => c.slot === index);
              return (
                <FarmSlot 
                  key={index}
                  onClick={() => crop?.stage === 5 ? harvestCrop(index) : plantCrop(index)}
                  isReady={crop?.stage === 5}
                >
                  {crop ? getCropEmoji(crop.stage) : '🟫'}
                  {crop && (
                    <Timer>
                      {Math.max(0, Math.ceil(12 - (Date.now() - crop.plantedAt) / 60000))}m
                    </Timer>
                  )}
                </FarmSlot>
              );
            })}
          </FarmGrid>
        </FarmScreen>
      )}

      {gameState === 'MARKET' && (
        <MarketContainer>
          <h1>Market</h1>
          <Market gold={gold} setGold={setGold} />
        </MarketContainer>
      )}

      <LogPanel>
        <LogHeader>
          Debug Logs
          <CopyButton 
            onClick={() => {
              const logText = logs.join('\n');
              copyToClipboard(logText)
                .then(success => addLog(success ? 'Logs copied!' : 'Failed to copy logs'));
            }}
          >
            📋 Copy Logs
          </CopyButton>
        </LogHeader>
        <LogContent>
          {logs.map((log, index) => (
            <LogEntry key={index}>{log}</LogEntry>
          ))}
        </LogContent>
      </LogPanel>
    </Container>
  );
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const CharacterSelect = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CharacterList = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const CharacterCard = styled.div`
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }
  
  div:first-child {
    font-size: 3em;
  }
`;

const FarmScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LogPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  z-index: 1000;
`;

const LogHeader = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #4CAF50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
`;

const LogContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
`;

const LogEntry = styled.div`
  padding: 2px 0;
  font-family: monospace;
  text-align: left;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  margin-bottom: 20px;
`;

const FarmGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 300px;
  margin: 0 auto;
`;

const FarmSlot = styled.div<{ isReady?: boolean }>`
  width: 80px;
  height: 80px;
  border: 2px solid ${props => props.isReady ? '#4CAF50' : '#8B4513'};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  cursor: pointer;
  background: ${props => props.isReady ? '#a5d6a7' : '#DEB887'};
  position: relative;
`;

const Timer = styled.div`
  position: absolute;
  bottom: 5px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
`;

const CopyButton = styled.button`
  float: right;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #45a049;
  }
  
  &:active {
    background: #3d8b40;
  }
`;

const MarketContainer = styled.div`
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
`;