import React from 'react';
import styled from 'styled-components';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Dispatch, SetStateAction } from 'react';

interface MarketProps {
  gold: number;
  setGold: Dispatch<SetStateAction<number>>;
  silver: number;
  setSilver: Dispatch<SetStateAction<number>>;
  userId: string;
  addLog: (message: string) => void;
}

interface CropInfo {
  name: string;
  emoji: string;
  growthTime: number; // in minutes
  sellPrice: number;
  isAvailable: boolean;
}

const crops: CropInfo[] = [
  { name: 'Wheat', emoji: '🌾', growthTime: 12, sellPrice: 20, isAvailable: true },
  { name: 'Beet', emoji: '🫐', growthTime: 15, sellPrice: 25, isAvailable: true },
  { name: 'Carrot', emoji: '🥕', growthTime: 20, sellPrice: 35, isAvailable: false },
  { name: 'Potato', emoji: '🥔', growthTime: 25, sellPrice: 45, isAvailable: false },
  { name: 'Tomato', emoji: '🍅', growthTime: 30, sellPrice: 55, isAvailable: false },
  { name: 'Corn', emoji: '🌽', growthTime: 35, sellPrice: 65, isAvailable: false },
  { name: 'Eggplant', emoji: '🍆', growthTime: 40, sellPrice: 75, isAvailable: false },
  { name: 'Pepper', emoji: '🫑', growthTime: 45, sellPrice: 85, isAvailable: false },
  { name: 'Mushroom', emoji: '🍄', growthTime: 50, sellPrice: 95, isAvailable: false },
  { name: 'Strawberry', emoji: '🍓', growthTime: 60, sellPrice: 120, isAvailable: false },
  { name: 'Grapes', emoji: '🍇', growthTime: 70, sellPrice: 140, isAvailable: false },
  { name: 'Watermelon', emoji: '🍉', growthTime: 80, sellPrice: 160, isAvailable: false },
  { name: 'Pineapple', emoji: '🍍', growthTime: 90, sellPrice: 180, isAvailable: false },
  { name: 'Coffee', emoji: '☕', growthTime: 100, sellPrice: 200, isAvailable: false },
  { name: 'Golden Apple', emoji: '🍎', growthTime: 120, sellPrice: 250, isAvailable: false },
];

const Market: React.FC<MarketProps> = ({ gold, setGold, silver, setSilver, userId, addLog }) => {
  const handleExchange = async () => {
    try {
      if (silver < 100) {
        addLog("Not enough silver! You need 100 silver to exchange for 1 gold.");
        return;
      }

      // Update state with properly typed parameters
      setSilver((prev: number) => prev - 100);
      setGold((prev: number) => prev + 1);

      // Update Firestore
      if (userId) {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          silver: silver - 100,
          gold: gold + 1
        }, { merge: true });
      }

      addLog("Exchanged 100 silver for 1 gold! ✨");
    } catch (error) {
      addLog(`Exchange error: ${(error as Error).message}`);
    }
  };

  return (
    <MarketScreen>
      <Header>
        <h2>Market</h2>
        <CurrencyDisplay>
          <div>🪙 {silver} Silver</div>
          <div>Gold: {gold}</div>
        </CurrencyDisplay>
      </Header>

      <ExchangeSection>
        <h3>Currency Exchange</h3>
        <ExchangeCard>
          <ExchangeRate>100 Silver = 1 Gold</ExchangeRate>
          <ExchangeButton 
            onClick={handleExchange}
            disabled={silver < 100}
          >
            Exchange Silver for Gold
          </ExchangeButton>
          {silver < 100 && (
            <ExchangeHint>
              Need {100 - silver} more silver
            </ExchangeHint>
          )}
        </ExchangeCard>
      </ExchangeSection>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Crop</Th>
              <Th>Growth Time</Th>
              <Th>Sell Price</Th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop, index) => (
              <TableRow key={crop.name} isAvailable={crop.isAvailable}>
                <Td>
                  <CropName>
                    {crop.emoji} {crop.name}
                    {!crop.isAvailable && <ComingSoon>Soon</ComingSoon>}
                  </CropName>
                </Td>
                <Td>{crop.growthTime} min</Td>
                <Td>{crop.sellPrice} 🪙</Td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </MarketScreen>
  );
};

const MarketScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

const CurrencyDisplay = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;

  div:last-child {
    color: #FFD700;
    font-weight: bold;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  color: white;
`;

const Th = styled.th`
  padding: 12px;
  background: rgba(255, 255, 255, 0.15);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  font-weight: bold;
  color: white;
`;

const TableRow = styled.tr<{ isAvailable: boolean }>`
  opacity: ${props => props.isAvailable ? 1 : 0.6};
  background: ${props => props.isAvailable ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  color: white;

  &:hover {
    background: ${props => props.isAvailable ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
`;

const CropName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComingSoon = styled.span`
  background: #FFD700;
  color: #333;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.7em;
  font-weight: bold;
`;

const ExchangeSection = styled.div`
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: white;

  h3 {
    margin-bottom: 15px;
    color: white;
  }
`;

const ExchangeCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
`;

const ExchangeRate = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
  width: fit-content;
`;

const ExchangeButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#cccccc' : '#4CAF50'};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  font-size: 1em;

  &:hover {
    background: ${props => props.disabled ? '#cccccc' : '#45a049'};
    transform: ${props => !props.disabled && 'translateY(-2px)'};
  }

  &:active {
    transform: ${props => !props.disabled && 'translateY(0)'};
  }
`;

const ExchangeHint = styled.div`
  color: #666;
  font-size: 0.9em;
  font-style: italic;
`;

export default Market; 