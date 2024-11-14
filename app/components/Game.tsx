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
import CharacterSelect from './CharacterSelect';
import Logs from './Logs';

type GameState = 'CHARACTER_SELECT' | 'FARM' | 'MARKET';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('CHARACTER_SELECT');
  const [userId, setUserId] = useState<string>('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [silver, setSilver] = useState(10);
  const [gold, setGold] = useState(0);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[LOG] ${timestamp}: ${message}`); // Log to console for debugging
    setLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      // Logic for loading user data
    };

    loadUser();
  }, [userId]); // Add userId as a dependency to ensure it updates correctly

  return (
    <Container>
      {gameState === 'CHARACTER_SELECT' && (
        <CharacterSelect setGameState={setGameState} setUserId={setUserId} setCharacter={setCharacter} />
      )}

      {gameState === 'FARM' && (
        <Farm 
          silver={silver} 
          setSilver={setSilver} 
          gold={gold} 
          setGold={setGold} 
          crops={crops} 
          setCrops={setCrops} 
          character={character} 
          addLog={addLog} 
        />
      )}

      {gameState === 'MARKET' && (
        <Market gold={gold} setGold={setGold} />
      )}

      <Logs logs={logs} />
    </Container>
  );
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;