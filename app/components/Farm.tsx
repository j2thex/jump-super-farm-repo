import React from 'react';
import styled from 'styled-components';

interface FarmProps {
  silver: number;
  setSilver: (silver: number) => void;
  gold: number;
  setGold: (gold: number) => void;
  crops: Crop[];
  setCrops: (crops: Crop[]) => void;
  character: any; // Adjust this type based on your character structure
  addLog: (message: string) => void;
}

interface Crop {
  slot: number;
  type: string;
  plantedAt: number;
  stage: number;
}

const getCropEmoji = (stage: number) => {
  switch (stage) {
    case 0:
      return '🌱'; // Seedling
    case 1:
      return '🌿'; // Young plant
    case 2:
      return '🌾'; // Mature plant
    case 3:
    case 4:
    case 5:
      return '🌾'; // Ready for harvest
    default:
      return '🟫'; // Default for no crop
  }
};

const Farm: React.FC<FarmProps> = ({ silver, setSilver, gold, setGold, crops, setCrops, character, addLog }) => {
  const plantCrop = async (slot: number) => {
    // Logic for planting crops
    addLog('A crop has been planted!');
  };

  const harvestCrop = async (slot: number) => {
    // Logic for harvesting crops
  };

  return (
    <FarmScreen>
      <Header>
        <h2>Welcome, {character?.name}!</h2>
        <div>Silver: {silver}</div>
        <div>Gold: {gold}</div>
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
  );
};

const FarmScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

export default Farm; 