'use client';
import { useState, useEffect } from 'react';
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

export default function StyledComponents() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [silver, setSilver] = useState(10);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

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
      {/* Keep the rest of your JSX exactly the same */}
      {/* ... */}
    </GameContainer>
  );
}

// Keep all your styled components and helper functions exactly the same
// ... 