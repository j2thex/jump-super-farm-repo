'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Market from './Market';
import Link from 'next/link';

type GameState = 'CHARACTER_SELECT' | 'FARM';

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

  // Use useEffect to ensure window is accessed only on the client side
  useEffect(() => {
    // Any code that uses window should be placed here
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

  // Update crop growth
  useEffect(() => {
    const interval = setInterval(() => {
      setCrops(currentCrops => 
        currentCrops.map(crop => {
          const minutesGrown = (Date.now() - crop.plantedAt) / (60 * 1000);
          const newStage = Math.min(5, Math.floor(minutesGrown / 2.4)) as CropStage;
          return { ...crop, stage: newStage };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const saveGameState = async () => {
    if (!userId) {
      addLog('No user ID, cannot save');
      return;
    }

    try {
      // Get the latest state directly
      const currentCrops = crops;
      const currentSilver = silver;

      addLog(`Current state before save: ${currentCrops.length} crops, ${currentSilver} silver`);
      addLog(`Crops data: ${JSON.stringify(currentCrops.map(c => c.slot))}`);

      const gameData = {
        userId,
        character,
        silver: currentSilver,
        crops: currentCrops.map(crop => ({
          ...crop,
          plantedAt: Number(crop.plantedAt),
          stage: Number(crop.stage)
        })),
        hasSelectedCharacter: true
      };

      await setDoc(doc(db, 'users', userId), gameData);
      addLog(`Saved state: ${currentCrops.length} crops, ${currentSilver} silver`);
    } catch (error: any) {
      addLog(`Save error: ${error.message}`);
    }
  };

  const selectCharacter = async (selected: Character) => {
    try {
      setCharacter(selected);
      setGameState('FARM');
      await saveGameState();
      addLog(`Selected ${selected.name}`);
    } catch (error: any) {
      addLog(`Error selecting character: ${error.message}`);
    }
  };

  const plantCrop = async (slot: number) => {
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
      try {
        const gameData = {
          userId,
          character,
          silver: silver - 2, // Use the new silver amount
          crops: newCrops.map(crop => ({  // Use the new crops array
            ...crop,
            plantedAt: Number(crop.plantedAt),
            stage: Number(crop.stage)
          })),
          hasSelectedCharacter: true
        };

        addLog(`Saving new state with crops: ${newCrops.map(c => c.slot).join(', ')}`);
        await setDoc(doc(db, 'users', userId), gameData);
        addLog(`Saved state with ${newCrops.length} crops`);
      } catch (error: any) {
        addLog(`Save error: ${error.message}`);
      }
    } else {
      addLog(`Cannot plant in slot ${slot}: ${silver < 2 ? 'Not enough silver' : 'Slot occupied'}`);
    }
  };

  const harvestCrop = async (slot: number) => {
    const crop = crops.find(c => c.slot === slot);
    if (crop && crop.stage === 5) {
      addLog(`Harvesting crop from slot ${slot}`);
      
      const newCrops = crops.filter(c => c.slot !== slot);
      const newSilver = silver + 5;
      
      // Update state
      setCrops(newCrops);
      setSilver(newSilver);
      
      // Save using the new values directly
      try {
        const gameData = {
          userId,
          character,
          silver: newSilver,
          crops: newCrops.map(crop => ({
            ...crop,
            plantedAt: Number(crop.plantedAt),
            stage: Number(crop.stage)
          })),
          hasSelectedCharacter: true
        };

        addLog(`Saving after harvest. Remaining crops: ${newCrops.map(c => c.slot).join(', ')}`);
        await setDoc(doc(db, 'users', userId), gameData);
        addLog(`Saved state with ${newCrops.length} crops`);
      } catch (error: any) {
        addLog(`Save error: ${error.message}`);
      }
    } else {
      addLog(`Cannot harvest slot ${slot}: ${!crop ? 'No crop' : 'Not ready'}`);
    }
  };

  const getCropEmoji = (stage: CropStage): string => {
    const stages = ['🌱', '🌿', '🌾', '🌾', '🌾', '🌾'];
    return stages[stage];
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
          <Link href="/market">
            <button>Go to Market</button>
          </Link>
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