import React from 'react';
import styled from 'styled-components';

interface Character {
  id: number;
  name: string;
  image: string;
}

interface CharacterSelectProps {
  characters: Character[];
  setGameState: (state: string) => void;
  setUserId: (id: string) => void;
  setCharacter: (character: Character) => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ characters, setGameState, setUserId, setCharacter }) => {
  const selectCharacter = (selected: Character) => {
    setCharacter(selected);
    setGameState('FARM');
  };

  return (
    <Container>
      <h2>Select Your Character</h2>
      {characters.map(character => (
        <CharacterCard key={character.id} onClick={() => selectCharacter(character)}>
          <img src={character.image} alt={character.name} />
          <h3>{character.name}</h3>
        </CharacterCard>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CharacterCard = styled.div`
  border: 1px solid #4CAF50;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export default CharacterSelect; 