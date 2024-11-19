import React, { useEffect, Dispatch, SetStateAction } from 'react';
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
  setSilver: Dispatch<SetStateAction<number>>;
  gold: number;
  setGold: Dispatch<SetStateAction<number>>;
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
      return '🎋'; // Growing
    case 3:
      return '🌾'; // Mature
    case 4:
      return '💫'; // Almost ready
    case 5:
      return '✨'; // Ready for harvest
    default:
      return '🟫'; // Empty soil
  }
};

const getCropStageName = (stage: number) => {
  switch (stage) {
    case 0:
      return 'Seedling';
    case 1:
      return 'Growing';
    case 2:
      return 'Young';
    case 3:
      return 'Mature';
    case 4:
      return 'Almost';
    case 5:
      return 'Ready!';
    default:
      return '';
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
  const getCropStage = (plantedAt: number, cropType: string): number => {
    const elapsed = Date.now() - plantedAt;
    const totalTime = CROP_TIMERS[cropType as keyof CropTimers];
    
    if (elapsed >= totalTime) return 5; // Ready for harvest
    
    const progress = elapsed / totalTime;
    if (progress >= 0.8) return 4;
    if (progress >= 0.6) return 3;
    if (progress >= 0.4) return 2;
    if (progress >= 0.2) return 1;
    return 0;
  };

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
    try {
      const cropIndex = crops.findIndex(c => c.slot === slot);
      if (cropIndex === -1) return;

      const crop = crops[cropIndex];
      const currentStage = getCropStage(crop.plantedAt, crop.type);

      if (currentStage < 5) {
        addLog("This crop isn't ready for harvest yet!");
        return;
      }

      // Remove the harvested crop
      const updatedCrops = crops.filter(c => c.slot !== slot);
      setCrops(updatedCrops);

      // Add rewards
      const reward = 20; // Base reward for wheat
      setSilver(prev => prev + reward);

      // Save to Firestore
      if (userId) {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          crops: updatedCrops,
          silver: silver + reward
        }, { merge: true });
      }

      addLog(`Harvested crop for ${reward} silver!`);

    } catch (error) {
      addLog(`Error harvesting crop: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedCrops = crops.map(crop => ({
        ...crop,
        stage: getCropStage(crop.plantedAt, crop.type)
      }));

      // Only update if stages have changed
      if (JSON.stringify(updatedCrops) !== JSON.stringify(crops)) {
        setCrops(updatedCrops);
      }
    }, 1000); // Check every second

    return () => clearInterval(timer);
  }, [crops, setCrops]);

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
            const stage = crop ? getCropStage(crop.plantedAt, crop.type) : 0;
            return (
              <FarmSlot 
                key={index}
                onClick={() => {
                  if (!crop) {
                    plantCrop(index);
                  } else if (stage === 5) {
                    harvestCrop(index);
                  }
                }}
                isReady={stage === 5}
              >
                {crop ? getCropEmoji(stage) : '🟫'}
                {crop && (
                  <CropInfo>
                    <StageName>{getCropStageName(stage)}</StageName>
                    {stage < 5 && (
                      <Timer>
                        {Math.max(0, Math.ceil((CROP_TIMERS[crop.type as keyof CropTimers] - (Date.now() - crop.plantedAt)) / 60000))}m
                      </Timer>
                    )}
                    {stage === 5 && (
                      <Timer style={{ background: '#4CAF50' }}>
                        Harvest!
                      </Timer>
                    )}
                  </CropInfo>
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
            const slotIndex = index + 100;
            const crop = crops.find(c => c.slot === slotIndex);
            const stage = crop ? getCropStage(crop.plantedAt, crop.type) : 0;
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
                  } else if (stage === 5) {
                    harvestCrop(slotIndex);
                  }
                }}
                isReady={stage === 5}
                isLocked={!hasGoldField}
              >
                {!hasGoldField ? '🔒' : crop ? getCropEmoji(stage) : '🟫'}
                {crop && hasGoldField && stage < 5 && (
                  <Timer>
                    {Math.max(0, Math.ceil((CROP_TIMERS[crop.type as keyof CropTimers] - (Date.now() - crop.plantedAt)) / 60000))}m
                  </Timer>
                )}
                {crop && hasGoldField && stage === 5 && (
                  <Timer style={{ background: '#4CAF50' }}>
                    Ready!
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
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => !props.isLocked && 'scale(1.05)'};
    box-shadow: ${props => !props.isLocked && '0 2px 8px rgba(0,0,0,0.2)'};
  }

  &:active {
    transform: ${props => !props.isLocked && 'scale(0.95)'};
  }
`;

const CropInfo = styled.div`
  position: absolute;
  bottom: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const StageName = styled.div`
  font-size: 10px;
  color: #666;
  background: rgba(255, 255, 255, 0.9);
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: bold;
`;

const Timer = styled.div`
  font-size: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 40px;
  text-align: center;
`;

export default Farm; 