import React from 'react';
import styled from 'styled-components';

interface MarketProps {
  gold: number;
  setGold: (gold: number) => void;
}

const Market: React.FC<MarketProps> = ({ gold, setGold }) => {
  return (
    <MarketScreen>
      <h2>Market</h2>
      <GoldDisplay>Gold: {gold}</GoldDisplay>
      <CropInfo>
        <h3>Available Crops</h3>
        <div>🌾 Wheat - 12 minutes</div>
        <div>🌾 Beet - 15 minutes (coming soon)</div>
      </CropInfo>
    </MarketScreen>
  );
};

const MarketScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const GoldDisplay = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  color: #FFD700;
`;

const CropInfo = styled.div`
  margin-top: 20px;
  text-align: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;

  h3 {
    margin-bottom: 10px;
    color: #4a4a4a;
  }

  div {
    margin: 8px 0;
    color: #666;
  }
`;

export default Market; 