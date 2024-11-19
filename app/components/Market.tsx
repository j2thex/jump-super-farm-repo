import React from 'react';
import styled from 'styled-components';

interface MarketProps {
  gold: number;
  setGold: (gold: number) => void;
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

const Market: React.FC<MarketProps> = ({ gold, setGold }) => {
  return (
    <MarketScreen>
      <Header>
        <h2>Market</h2>
        <GoldDisplay>Gold: {gold}</GoldDisplay>
      </Header>

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

const GoldDisplay = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  color: #FFD700;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
  font-weight: bold;
  color: #333;
`;

const TableRow = styled.tr<{ isAvailable: boolean }>`
  opacity: ${props => props.isAvailable ? 1 : 0.6};
  background: ${props => props.isAvailable ? 'white' : '#f9f9f9'};

  &:hover {
    background: ${props => props.isAvailable ? '#f0f0f0' : '#f5f5f5'};
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
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

export default Market; 