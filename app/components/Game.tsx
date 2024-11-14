'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Market from './Market';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import UserManagement from './UserManagement';
import Farm from './Farm';
import Logs from './Logs';
import BottomNavigation from './BottomNavigation';

type GameState = 'BONUS_SELECT' | 'FARM' | 'MARKET' | 'SWAP' | 'REFERRALS';

interface Bonus {
  id: number;
  name: string;
  description: string;
}

interface Crop {
  slot: number;
  type: string;
  plantedAt: number;
  stage: number;
}

const bonuses: Bonus[] = [
  { id: 1, name: 'Speed', description: 'Grow crops 20% faster' },
  { id: 2, name: 'More farms', description: '20% more farmland' },
  { id: 3, name: 'Higher price', description: '20% more profit' },
];

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('BONUS_SELECT');
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
  const [silver, setSilver] = useState(10);
  const [gold, setGold] = useState(0);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('Web surfer'); // Default to "Web surfer"

  useEffect(() => {
    // Check if the user is coming from Telegram
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Telegram")) {
      const firstName = Cookies.get('firstName'); // Example: Get from cookies
      if (firstName) {
        setUserName(firstName);
      }
    }
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[LOG] ${timestamp}: ${message}`);
    setLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  const handleBonusSelect = (bonus: Bonus) => {
    setSelectedBonus(bonus);
    setGameState('FARM'); // Move to FARM state after selecting a bonus
    addLog(`Selected bonus: ${bonus.name}`);
  };

  return (
    <Container>
      <Header>
        <h2>Welcome, {userName}!</h2>
      </Header>
      {gameState === 'BONUS_SELECT' && (
        <BonusSelect>
          <h2>Select a Bonus</h2>
          {bonuses.map(bonus => (
            <BonusOption key={bonus.id} onClick={() => handleBonusSelect(bonus)}>
              <h3>{bonus.name}</h3>
              <p>{bonus.description}</p>
            </BonusOption>
          ))}
        </BonusSelect>
      )}

      {gameState === 'FARM' && (
        <Farm 
          silver={silver} 
          setSilver={setSilver} 
          gold={gold} 
          setGold={setGold} 
          crops={crops} 
          setCrops={setCrops} 
          selectedBonus={selectedBonus} // Pass selected bonus to Farm
          addLog={addLog} 
        />
      )}

      {gameState === 'MARKET' && (
        <Market gold={gold} setGold={setGold} />
      )}

      {gameState === 'SWAP' && (
        <div>Swap Page Content</div>
      )}

      {gameState === 'REFERRALS' && (
        <div>Referrals Page Content</div>
      )}

      {gameState !== 'BONUS_SELECT' && <BottomNavigation setGameState={setGameState} />}
      <Logs logs={logs} addLog={addLog} />
    </Container>
  );
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const BonusSelect = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BonusOption = styled.div`
  border: 1px solid #4CAF50;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  cursor: pointer;
  width: 80%;
  text-align: center;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;