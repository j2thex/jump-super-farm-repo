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

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('CHARACTER_SELECT');
  const [userId, setUserId] = useState<string>('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        const testUserId = 'test123';
        setUserId(testUserId);

        const userRef = doc(db, 'users', testUserId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Loaded user data:', userData);
          
          if (userData.character) {
            console.log('Found character:', userData.character);
            setCharacter(userData.character);
            setGameState('FARM');
          }
        } else {
          console.log('Creating new user');
          await setDoc(userRef, {
            userId: testUserId,
            character: null
          });
        }

        WebApp.ready();
        setIsLoading(false);
      } catch (error) {
        console.error('Init error:', error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const selectCharacter = async (selectedCharacter: Character) => {
    try {
      console.log('Selecting character:', selectedCharacter);
      await setDoc(doc(db, 'users', userId), {
        userId,
        character: selectedCharacter
      });

      setCharacter(selectedCharacter);
      setGameState('FARM');
    } catch (error) {
      console.error('Character selection error:', error);
    }
  };

  if (isLoading) {
    return <Container>Loading game...</Container>;
  }

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