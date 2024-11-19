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
          <IconText>🌾</IconText>
          <ButtonText>Farm</ButtonText>
        </NavButton>
        <NavButton onClick={() => setGameState('MARKET')}>
          <IconText>🏪</IconText>
          <ButtonText>Market</ButtonText>
        </NavButton>
        <NavButton onClick={() => setGameState('SWAP')}>
          <IconText>💱</IconText>
          <ButtonText>Swap</ButtonText>
        </NavButton>
        <NavButton onClick={() => setGameState('REFERRALS')}>
          <IconText>👥</IconText>
          <ButtonText>Referrals</ButtonText>
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
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border-top: 2px solid #eee;
`;

const NavBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 600px;
  margin: 0 auto;
  padding: 12px;
  gap: 8px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #333;
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    color: #4CAF50;
    transform: translateY(-2px);
    background: rgba(74, 175, 80, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconText = styled.span`
  font-size: 1.5em;
`;

const ButtonText = styled.span`
  font-size: 1em;
  font-weight: 500;
`;

export default BottomNavigation; 