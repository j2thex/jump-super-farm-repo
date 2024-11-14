import React, { useState } from 'react';
import styled from 'styled-components';

// Define the props interface
interface MarketProps {
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

const crops = [
  { name: 'Wheat', price: 10 },
  { name: 'Corn', price: 15 },
  // Add more crops as needed
];

const Market: React.FC<MarketProps> = ({ gold, setGold }) => {
  const [activeTab, setActiveTab] = useState<'crops' | 'research'>('crops');

  const upgradeCrop = (cropName: string) => {
    const crop = crops.find(c => c.name === cropName);
    if (crop && gold >= crop.price) {
      setGold(prevGold => prevGold - crop.price);
      alert(`Upgraded ${cropName} for ${crop.price} gold!`);
    } else {
      alert('Not enough gold to upgrade this crop.');
    }
  };

  const unlockResearch = () => {
    if (gold >= 10) {
      setGold(prevGold => prevGold - 10);
      alert('Research unlocked!');
    } else {
      alert('Not enough gold to unlock research.');
    }
  };

  return (
    <Container>
      <TabContainer>
        <Tab onClick={() => setActiveTab('crops')} active={activeTab === 'crops'}>Cultures</Tab>
        <Tab onClick={() => setActiveTab('research')} active={activeTab === 'research'}>Research</Tab>
      </TabContainer>
      {activeTab === 'crops' && (
        <CropsContainer>
          <h3>Cultures</h3>
          {crops.map(crop => (
            <CropItem key={crop.name}>
              <span>{crop.name} - {crop.price} Gold</span>
              <button onClick={() => upgradeCrop(crop.name)}>Upgrade</button>
            </CropItem>
          ))}
        </CropsContainer>
      )}
      {activeTab === 'research' && (
        <ResearchContainer>
          <h3>Research</h3>
          <button onClick={unlockResearch}>Unlock Research (10 Gold)</button>
        </ResearchContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
`;

const Tab = styled.div<{ active: boolean }>`
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: ${props => (props.active ? '#4CAF50' : '#f5f5f5')};
  color: ${props => (props.active ? '#fff' : '#000')};
`;

const CropsContainer = styled.div`
  margin-top: 10px;
`;

const CropItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
`;

const ResearchContainer = styled.div`
  margin-top: 10px;
`;

export default Market; 