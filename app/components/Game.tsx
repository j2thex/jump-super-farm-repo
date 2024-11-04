'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Game states
type GameState = 'START' | 'CHARACTER_SELECT' | 'FARM' | 'RESEARCH' | 'MARKET';

// Character types
type Character = {
  id: number;
  name: string;
  image: string;
};

// Crop growth stages (1-5)
type CropStage = 0 | 1 | 2 | 3 | 4 | 5;

// Crop data
type Crop = {
  slot: number;
  type: 'wheat';
  plantedAt: number;
  stage: CropStage;
  lastWatered?: number;
  harvestReady?: boolean;
};

interface ResearchItemProps {
  disabled?: boolean;
}

const characters: Character[] = [
  { id: 1, name: 'Farmer John', image: '👨‍🌾' },
  { id: 2, name: 'Farmer Jane', image: '👩‍🌾' },
  { id: 3, name: 'Farmer Jack', image: '🧑‍🌾' },
];

// Add new type for user data
type UserData = {
  userId: string;
  character: Character | null;
  silver: number;
  crops: Crop[];
  unlockedItems: string[];
  firstTime: boolean;
};

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [silver, setSilver] = useState(10);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const log = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  // Initialize user data
  useEffect(() => {
    const initUser = async () => {
      try {
        // Dynamically import WebApp
        const WebApp = (await import('@twa-dev/sdk')).default;
        
        // Get Telegram user ID
        const tgUser = WebApp.initDataUnsafe?.user;
        log(`Telegram user: ${JSON.stringify(tgUser)}`);

        if (!tgUser?.id) {
          console.error('No Telegram user ID found');
          const defaultId = '12345';
          setUserId(defaultId);
          console.log('Using default ID:', defaultId);
        } else {
          const userId = tgUser.id.toString();
          setUserId(userId);
          console.log('Set user ID:', userId);
        }

        // Get user data from Firestore
        const userDocRef = doc(db, 'users', userId || '12345');
        const userDoc = await getDoc(userDocRef);
        console.log('Firestore doc:', userDoc.data());
        
        if (userDoc.exists()) {
          // User exists, load their data
          const userData = userDoc.data() as UserData;
          console.log('Loading user data:', userData);
          setSelectedCharacter(userData.character);
          setSilver(userData.silver);
          setCrops(userData.crops);
          setUnlockedItems(userData.unlockedItems);
          setGameState(userData.firstTime ? 'CHARACTER_SELECT' : 'FARM');
        } else {
          // New user, create their document
          const newUserData: UserData = {
            userId: userId || '12345',
            character: null,
            silver: 10,
            crops: [],
            unlockedItems: [],
            firstTime: true
          };
          console.log('Creating new user:', newUserData);
          await setDoc(userDocRef, newUserData);
          setGameState('CHARACTER_SELECT');
        }
        
        WebApp.ready();
        setLoading(false);
      } catch (error) {
        console.error('Error initializing user:', error);
        setLoading(false);
      }
    };

    initUser();
  }, []);

  // Save user data when it changes
  const saveUserData = async () => {
    if (!userId) {
      log('No user ID, skipping save');
      return;
    }

    try {
      const userData: UserData = {
        userId,
        character: selectedCharacter,
        silver,
        crops,
        unlockedItems,
        firstTime: false
      };
      
      await setDoc(doc(db, 'users', userId), userData);
      log('Data saved successfully');
    } catch (error) {
      log(`Error saving: ${error}`);
    }
  };

  // Update user data whenever important state changes
  useEffect(() => {
    if (!loading) {
      saveUserData();
    }
  }, [silver, crops, unlockedItems, selectedCharacter]);

  // Update existing functions to save data
  const selectCharacter = async (character: Character) => {
    setSelectedCharacter(character);
    setGameState('FARM');
    await saveUserData();
  };

  const plantCrop = async (slot: number) => {
    if (silver >= 2 && !crops.find(crop => crop.slot === slot)) {
      const newCrops = [...crops, {
        slot,
        type: 'wheat' as const,
        plantedAt: Date.now(),
        stage: 0 as CropStage
      }];
      console.log('Planting crop:', newCrops);
      setCrops(newCrops);
      setSilver(silver - 2);
      await saveUserData();
    }
  };

  const researchItem = (item: string, cost: number) => {
    if (silver >= cost && !unlockedItems.includes(item)) {
      setUnlockedItems([...unlockedItems, item]);
      setSilver(silver - cost);
    }
  };

  // Helper function to get crop emoji based on growth stage
  const getCropEmoji = (stage: CropStage): string => {
    const stages = ['🌱', '🌿', '🌾', '🌾', '🌾', '🌾'];
    return stages[stage];
  };

  // Update crop growth stages every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCrops(currentCrops => 
        currentCrops.map(crop => {
          const minutesGrown = (Date.now() - crop.plantedAt) / (60 * 1000);
          const newStage = Math.min(5, Math.floor(minutesGrown / 2.4)) as CropStage;
          return { ...crop, stage: newStage };
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (plantedAt: number): string => {
    const now = Date.now();
    const growthTime = 12 * 60 * 1000; // 12 minutes in milliseconds
    const timeLeft = Math.max(0, (plantedAt + growthTime) - now);
    
    if (timeLeft === 0) return 'Ready!';
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const harvestCrop = async (slot: number) => {
    const crop = crops.find(c => c.slot === slot);
    if (crop && crop.stage === 5) {
      console.log('Harvesting crop:', crop);
      setSilver(silver + 5);
      setCrops(crops.filter(c => c.slot !== slot));
      await saveUserData();
    }
  };

  // Add this with other functions
  const startGame = () => {
    setGameState('CHARACTER_SELECT');
  };

  const showDebug = process.env.NODE_ENV === 'development';

  if (loading) {
    return (
      <LoadingScreen>
        <h2>Loading...</h2>
      </LoadingScreen>
    );
  }

  return (
    <GameContainer>
      {gameState === 'START' && (
        <StartScreen>
          <h1>Happy Farmer</h1>
          <StartButton onClick={startGame}>Start Game</StartButton>
        </StartScreen>
      )}

      {gameState === 'CHARACTER_SELECT' && (
        <CharacterSelect>
          <h2>Choose Your Character</h2>
          <CharacterList>
            {characters.map(character => (
              <CharacterCard 
                key={character.id}
                onClick={() => selectCharacter(character)}
              >
                <div className="character-image">{character.image}</div>
                <div className="character-name">{character.name}</div>
              </CharacterCard>
            ))}
          </CharacterList>
        </CharacterSelect>
      )}

      {gameState === 'FARM' && (
        <FarmScreen>
          <TopBar>
            <div>Silver: {silver}</div>
            <div>
              <button onClick={() => setGameState('MARKET')}>Market</button>
              <button onClick={() => setGameState('RESEARCH')}>Research</button>
            </div>
          </TopBar>
          
          <FarmGrid>
            {Array.from({ length: 6 }).map((_, index) => {
              const crop = crops.find(c => c.slot === index);
              return (
                <FarmSlotContainer key={index}>
                  <FarmSlot 
                    onClick={() => crop?.stage === 5 ? harvestCrop(index) : plantCrop(index)}
                    isReady={crop?.stage === 5}
                  >
                    {crop ? getCropEmoji(crop.stage) : '🟫'}
                  </FarmSlot>
                  {crop && (
                    <Timer>
                      {formatTimeLeft(crop.plantedAt)}
                    </Timer>
                  )}
                </FarmSlotContainer>
              );
            })}
          </FarmGrid>
        </FarmScreen>
      )}

      {gameState === 'RESEARCH' && (
        <ResearchScreen>
          <h2>Research</h2>
          <ResearchList>
            <ResearchItem 
              onClick={() => researchItem('wheat', 5)}
              disabled={unlockedItems.includes('wheat')}
            >
              Wheat Seeds (5 silver)
            </ResearchItem>
            <ResearchItem 
              onClick={() => researchItem('well', 8)}
              disabled={unlockedItems.includes('well')}
            >
              Well (8 silver)
            </ResearchItem>
          </ResearchList>
          <BackButton onClick={() => setGameState('FARM')}>
            Back to Farm
          </BackButton>
        </ResearchScreen>
      )}

      {gameState === 'MARKET' && (
        <MarketScreen>
          <h2>Market</h2>
          <MarketInfo>
            <p>Current Prices:</p>
            <ul>
              <li>Wheat: 5 silver</li>
            </ul>
          </MarketInfo>
          <BackButton onClick={() => setGameState('FARM')}>
            Back to Farm
          </BackButton>
        </MarketScreen>
      )}

      {showDebug && (
        <DebugPanel>
          <h3>Debug Log</h3>
          <div>User ID: {userId}</div>
          <div>Silver: {silver}</div>
          <div>Crops: {crops.length}</div>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {debugLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </DebugPanel>
      )}
    </GameContainer>
  );
}

const GameContainer = styled('div')`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  color: #333;
  @media (prefers-color-scheme: dark) {
    color: #fff;
  }
`;

const StartScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const StartButton = styled.button`
  padding: 15px 30px;
  font-size: 1.2em;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
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
  background: ${props => props.theme.mode === 'dark' ? '#333' : '#fff'};
  
  @media (prefers-color-scheme: dark) {
    background: #333;
    border-color: #555;
  }
  
  .character-image {
    font-size: 3em;
  }
  
  .character-name {
    margin-top: 10px;
  }
`;

const FarmScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 5px;
  
  @media (prefers-color-scheme: dark) {
    background: #333;
    color: #fff;
    
    button {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background: #45a049;
      }
    }
  }
`;

const FarmGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px auto;
`;

const FarmSlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

const Timer = styled.div`
  font-size: 0.8em;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#666'};
  
  @media (prefers-color-scheme: dark) {
    color: #fff;
  }
`;

const FarmSlot = styled.div<{ isReady?: boolean }>`
  width: 80px;
  height: 80px;
  border: 2px solid ${props => props.isReady ? '#4CAF50' : '#8B4513'};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  cursor: pointer;
  background: ${props => props.isReady ? '#a5d6a7' : '#DEB887'};
  
  @media (prefers-color-scheme: dark) {
    background: ${props => props.isReady ? '#2e7d32' : '#5c4a3d'};
    border-color: ${props => props.isReady ? '#4CAF50' : '#8B4513'};
  }
`;

const ResearchScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (prefers-color-scheme: dark) {
    h2 {
      color: #fff;
    }
  }
`;

const ResearchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResearchItem = styled('button')<ResearchItemProps>`
  padding: 10px;
  background: ${props => props.disabled ? '#666' : '#4CAF50'};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  @media (prefers-color-scheme: dark) {
    background: ${props => props.disabled ? '#444' : '#4CAF50'};
  }
`;

const BackButton = styled.button`
  padding: 10px;
  background: #666;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background: #555;
  }
  
  @media (prefers-color-scheme: dark) {
    background: #444;
    &:hover {
      background: #333;
    }
  }
`;

const MarketScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (prefers-color-scheme: dark) {
    h2 {
      color: #fff;
    }
  }
`;

const MarketInfo = styled.div`
  padding: 20px;
  background: #f5f5f5;
  border-radius: 5px;
  
  @media (prefers-color-scheme: dark) {
    background: #333;
    color: #fff;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 10px 0;
  }
  
  li {
    padding: 5px 0;
  }
`;

// Add new styled component
const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  
  h2 {
    color: var(--tg-theme-text-color, #000);
  }
`;

const DebugPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`; 