'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('CHARACTER_SELECT');
  const [userId, setUserId] = useState<string>('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [silver, setSilver] = useState(10);
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
      const gameData = {
        userId,
        character,
        silver,
        crops: crops.map(crop => ({
          ...crop,
          plantedAt: Number(crop.plantedAt),
          stage: Number(crop.stage)
        })),
        hasSelectedCharacter: true
      };

      addLog(`Saving game state: ${crops.length} crops, ${silver} silver`);
      await setDoc(doc(db, 'users', userId), gameData);
      addLog('Game state saved successfully');
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
      const newCrops: Crop[] = [...crops, {
        slot,
        type: 'wheat' as const,
        plantedAt: Date.now(),
        stage: 0 as CropStage
      }];
      
      setCrops(newCrops);
      setSilver(prev => prev - 2);
      
      addLog(`Planting crop in slot ${slot}`);
      await saveGameState();
    }
  };

  const harvestCrop = async (slot: number) => {
    const crop = crops.find(c => c.slot === slot);
    if (crop && crop.stage === 5) {
      setSilver(prev => prev + 5);
      setCrops(prev => prev.filter(c => c.slot !== slot));
      
      addLog(`Harvesting crop from slot ${slot}`);
      await saveGameState();
    }
  };

  const getCropEmoji = (stage: CropStage): string => {
    const stages = ['🌱', '🌿', '🌾', '🌾', '🌾', '🌾'];
    return stages[stage];
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
          </Header>
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
        <LogHeader>Debug Logs</LogHeader>
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