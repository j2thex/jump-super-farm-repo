'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

// Game states
type GameState = 'START' | 'CHARACTER_SELECT' | 'FARM' | 'RESEARCH';

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
};

// Props type for ResearchItem
interface ResearchItemProps {
  disabled?: boolean;
}

const characters: Character[] = [
  { id: 1, name: 'Farmer John', image: '👨‍🌾' },
  { id: 2, name: 'Farmer Jane', image: '👩‍🌾' },
  { id: 3, name: 'Farmer Jack', image: '🧑‍🌾' },
];

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [silver, setSilver] = useState(10);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

  useEffect(() => {
    // Import WebApp dynamically to avoid SSR issues
    const initWebApp = async () => {
      const WebApp = (await import('@twa-dev/sdk')).default;
      WebApp.ready();
    };
    
    initWebApp().catch(console.error);
  }, []);

  const startGame = () => {
    setGameState('CHARACTER_SELECT');
  };

  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setGameState('FARM');
  };

  const plantCrop = (slot: number) => {
    if (silver >= 2 && !crops.find(crop => crop.slot === slot)) {
      setCrops([...crops, {
        slot,
        type: 'wheat',
        plantedAt: Date.now(),
        stage: 0
      }]);
      setSilver(silver - 2);
    }
  };

  const researchItem = (item: string, cost: number) => {
    if (silver >= cost && !unlockedItems.includes(item)) {
      setUnlockedItems([...unlockedItems, item]);
      setSilver(silver - cost);
    }
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
            <button onClick={() => setGameState('RESEARCH')}>Research</button>
          </TopBar>
          
          <FarmGrid>
            {Array.from({ length: 6 }).map((_, index) => {
              const crop = crops.find(c => c.slot === index);
              return (
                <FarmSlot 
                  key={index}
                  onClick={() => plantCrop(index)}
                >
                  {crop ? getCropEmoji(crop.stage) : '🟫'}
                </FarmSlot>
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
    </GameContainer>
  );
}

// Helper function to get crop emoji based on growth stage
function getCropEmoji(stage: CropStage): string {
  const stages = ['🌱', '🌿', '🌾', '🌾', '🌾', '🌾'];
  return stages[stage];
}

// Styled components with fixed TypeScript errors
const GameContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
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
`;

const FarmGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px auto;
`;

const FarmSlot = styled.div`
  width: 80px;
  height: 80px;
  border: 2px solid #8B4513;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  cursor: pointer;
  background: #DEB887;
`;

const ResearchScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ResearchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResearchItem = styled.button<ResearchItemProps>`
  padding: 10px;
  background: ${(props: ResearchItemProps) => props.disabled ? '#ccc' : '#4CAF50'};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: ${(props: ResearchItemProps) => props.disabled ? 'not-allowed' : 'pointer'};
`;

const BackButton = styled.button`
  padding: 10px;
  background: #666;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;