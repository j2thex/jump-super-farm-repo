'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Basic types
type GameState = 'CHARACTER_SELECT' | 'FARM';

type Character = {
  id: number;
  name: string;
  image: string;
};

const characters: Character[] = [
  { id: 1, name: 'Farmer John', image: '👨‍🌾' },
  { id: 2, name: 'Farmer Jane', image: '👩‍🌾' },
  { id: 3, name: 'Farmer Jack', image: '🧑‍🌾' },
];

// Debug component to show current state
const DebugPanel = ({ state }: { state: any }) => (
  <div style={{ 
    position: 'fixed', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    background: 'rgba(0,0,0,0.8)', 
    color: 'white', 
    padding: '10px',
    fontSize: '12px'
  }}>
    <pre>{JSON.stringify(state, null, 2)}</pre>
  </div>
);

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('CHARACTER_SELECT');
  const [userId, setUserId] = useState<string>('test123');
  const [character, setCharacter] = useState<Character | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log function
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        addLog('Starting user data load...');
        addLog(`Using user ID: ${userId}`);
        
        const userRef = doc(db, 'users', userId);
        addLog('Attempting to read from Firebase...');
        
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          addLog('No existing user document found');
          // Create new user
          const newUserData = {
            userId,
            character: null,
            hasSelectedCharacter: false
          };
          
          addLog('Creating new user document...');
          await setDoc(userRef, newUserData);
          addLog('New user document created');
          
        } else {
          const userData = userDoc.data();
          addLog(`Found user data: ${JSON.stringify(userData, null, 2)}`);
          
          if (userData.character) {
            addLog(`Loading character: ${userData.character.name}`);
            setCharacter(userData.character);
            setGameState('FARM');
          } else {
            addLog('No character found, staying on selection screen');
          }
        }

        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
      } catch (error: any) {
        addLog('ERROR DETAILS:');
        addLog(`Code: ${error.code}`);
        addLog(`Message: ${error.message}`);
        if (error.stack) {
          addLog(`Stack: ${error.stack.split('\n')[0]}`);
        }
      }
    };

    loadUser();
  }, [userId]);

  const selectCharacter = async (selected: Character) => {
    try {
      addLog(`Selecting character: ${selected.name}`);
      
      const userData = {
        userId,
        character: selected,
        hasSelectedCharacter: true
      };

      await setDoc(doc(db, 'users', userId), userData);
      addLog('Character saved to Firebase');
      
      setCharacter(selected);
      setGameState('FARM');
      
      // Verify save
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      addLog(`Verification - Firebase data: ${JSON.stringify(userDoc.data())}`);
    } catch (error) {
      addLog(`Error saving character: ${error}`);
    }
  };

  return (
    <Container>
      {gameState === 'CHARACTER_SELECT' && (
        <CharacterSelect>
          <h2>Choose Your Character</h2>
          <CharacterList>
            {characters.map(char => (
              <CharacterCard 
                key={char.id}
                onClick={() => selectCharacter(char)}
              >
                <div>{char.image}</div>
                <div>{char.name}</div>
              </CharacterCard>
            ))}
          </CharacterList>
        </CharacterSelect>
      )}

      {gameState === 'FARM' && (
        <FarmScreen>
          <h2>Welcome, {character?.name}!</h2>
          <p>Your farm is ready.</p>
        </FarmScreen>
      )}

      <LogPanel>
        <LogHeader>Debug Logs</LogHeader>
        <LogContent>
          {logs.map((log, index) => (
            <LogEntry key={index}>{log}</LogEntry>
          ))}
        </LogContent>
      </LogPanel>
    </Container>
  );
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const CharacterSelect = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CharacterList = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const CharacterCard = styled.div`
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }
  
  div:first-child {
    font-size: 3em;
  }
`;

const FarmScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LogPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  z-index: 1000;
`;

const LogHeader = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #4CAF50;
`;

const LogContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
`;

const LogEntry = styled.div`
  padding: 2px 0;
  font-family: monospace;
  text-align: left;
`;