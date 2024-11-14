import React from 'react';
import styled from 'styled-components';

const CharacterSelect = ({ setGameState, setUserId, setCharacter }) => {
  const selectCharacter = (selected) => {
    setCharacter(selected);
    setGameState('FARM');
    // Save user data to Firebase logic here
  };

  return (
    <CharacterSelectContainer>
      <h2>Choose Your Character</h2>
      <CharacterList>
        {characters.map(char => (
          <CharacterCard key={char.id} onClick={() => selectCharacter(char)}>
            <div>{char.image}</div>
            <div>{char.name}</div>
          </CharacterCard>
        ))}
      </CharacterList>
    </CharacterSelectContainer>
  );
};

const CharacterSelectContainer = styled.div`
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

export default CharacterSelect; 