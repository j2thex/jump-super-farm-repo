import React from 'react';
import styled from 'styled-components';
import { GameState } from '../types/game';

interface BottomNavigationProps {
  setGameState: (state: GameState) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ setGameState }) => {
  return (
    <NavContainer>
      <NavBar>
        <NavButton onClick={() => setGameState('FARM')}>
          🌾 Farm
        </NavButton>
        <NavButton onClick={() => setGameState('MARKET')}>
          🏪 Market
        </NavButton>
        <NavButton onClick={() => setGameState('SWAP')}>
          💱 Swap
        </NavButton>
        <NavButton onClick={() => setGameState('REFERRALS')}>
          👥 Referrals
        </NavButton>
      </NavBar>
    </NavContainer>
  );
};

const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const NavBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
  gap: 5px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #333;
  transition: all 0.3s ease;

  &:hover {
    color: #4CAF50;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default BottomNavigation; 