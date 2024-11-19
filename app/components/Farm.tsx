import React from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

interface Bonus {
  id: number;
  name: string;
  description: string;
}

interface FarmProps {
  silver: number;
  setSilver: (silver: number) => void;
  gold: number;
  setGold: (gold: number) => void;
  crops: Crop[];
  setCrops: (crops: Crop[]) => void;
  selectedBonus: Bonus | null;
  addLog: (message: string) => void;
  userId: string;
  hasGoldField?: boolean;
}

interface Crop {
  slot: number;
  type: string;
  plantedAt: number;
  stage: number;
}

interface CropTimers {
  wheat: number;  // 12 minutes in milliseconds
  beet: number;   // 15 minutes in milliseconds
}

const CROP_TIMERS: CropTimers = {
  wheat: 12 * 60 * 1000, // 12 minutes
  beet: 15 * 60 * 1000   // 15 minutes
};

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

const Farm: React.FC<FarmProps> = ({ 
  silver, 
  setSilver, 
  gold, 
  setGold, 
  crops, 
  setCrops, 
  selectedBonus, 
  addLog, 
  userId,
  hasGoldField = false
}) => {
  const plantCrop = async (slot: number) => {
    try {
      // Check if slot is already occupied
      if (crops.some(crop => crop.slot === slot)) {
        return;
      }

      // Default to wheat for now, we can add crop selection later
      const type = 'wheat';
      const now = Date.now();
      const newCrop = {
        slot,
        type,
        plantedAt: now,
        stage: 0
      };

      const updatedCrops = [...crops, newCrop];
      setCrops(updatedCrops);

      // Save to Firestore
      if (userId) {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          crops: updatedCrops
        }, { merge: true });
      }

      addLog('A crop has been planted!');

      // Calculate harvest time based on crop type
      const harvestTime = CROP_TIMERS[type as keyof CropTimers];
      const harvestDate = new Date(now + harvestTime);
      addLog(`Will be ready at: ${harvestDate.toLocaleTimeString()}`);

    } catch (error) {
      addLog(`Error planting crop: ${(error as Error).message}`);
    }
  };

  const harvestCrop = async (slot: number) => {
    // Logic for harvesting crops
  };

  return (
    <FarmScreen>
      <Header>
        <h2>Welcome to the Farm!</h2>
        <div>Silver: {silver}</div>
        <div>Gold: {gold}</div>
        {selectedBonus && <div>Bonus: {selectedBonus.name}</div>}
      </Header>
      
      <FarmSection>
        <h3>Silver Fields</h3>
        <FarmGrid>
          {Array.from({ length: 6 }).map((_, index) => {
            const crop = crops.find(c => c.slot === index);
            return (
              <FarmSlot 
                key={index}
                onClick={() => {
                  if (!crop) {
                    plantCrop(index);
                  } else if (crop.stage === 5) {
                    harvestCrop(index);
                  }
                }}
                isReady={crop?.stage === 5}
              >
                {crop ? getCropEmoji(crop.stage) : '🟫'}
                {crop && (
                  <Timer>
                    {Math.max(0, Math.ceil((CROP_TIMERS[crop.type as keyof CropTimers] - (Date.now() - crop.plantedAt)) / 60000))}m
                  </Timer>
                )}
              </FarmSlot>
            );
          })}
        </FarmGrid>
      </FarmSection>

      <FarmSection>
        <GoldHeader>
          <h3>Gold Fields</h3>
          {!hasGoldField && <LockedBadge>🔒 Locked</LockedBadge>}
        </GoldHeader>
        <FarmGrid>
          {Array.from({ length: 3 }).map((_, index) => {
            const slotIndex = index + 100; // Use 100+ for gold field slots
            const crop = crops.find(c => c.slot === slotIndex);
            return (
              <FarmSlot 
                key={slotIndex}
                onClick={() => {
                  if (!hasGoldField) {
                    addLog('Gold fields are locked. Purchase to unlock!');
                    return;
                  }
                  if (!crop) {
                    plantCrop(slotIndex);
                  } else if (crop.stage === 5) {
                    harvestCrop(slotIndex);
                  }
                }}
                isReady={crop?.stage === 5}
                isLocked={!hasGoldField}
              >
                {!hasGoldField ? '🔒' : crop ? getCropEmoji(crop.stage) : '🟫'}
                {crop && hasGoldField && (
                  <Timer>
                    {Math.max(0, Math.ceil((CROP_TIMERS[crop.type as keyof CropTimers] - (Date.now() - crop.plantedAt)) / 60000))}m
                  </Timer>
                )}
              </FarmSlot>
            );
          })}
        </FarmGrid>
      </FarmSection>
    </FarmScreen>
  );
};

const FarmScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
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

const FarmSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const GoldHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  
  h3 {
    color: #FFD700;
  }
`;

const LockedBadge = styled.span`
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
`;

const FarmSlot = styled.div<{ isReady?: boolean; isLocked?: boolean }>`
  width: 80px;
  height: 80px;
  border: 2px solid ${props => props.isLocked ? '#666' : props.isReady ? '#4CAF50' : '#8B4513'};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  cursor: ${props => props.isLocked ? 'not-allowed' : 'pointer'};
  background: ${props => props.isLocked ? '#444' : props.isReady ? '#a5d6a7' : '#DEB887'};
  opacity: ${props => props.isLocked ? 0.7 : 1};
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