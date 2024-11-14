import React from 'react';
import styled from 'styled-components';

type GameState = 'BONUS_SELECT' | 'FARM' | 'MARKET' | 'SWAP' | 'REFERRALS';

interface BottomNavigationProps {
  setGameState: (state: GameState) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ setGameState }) => {
  return (
    <NavContainer>
      <NavItem onClick={() => setGameState('FARM')}>Farm</NavItem>
      <NavItem onClick={() => setGameState('MARKET')}>Market</NavItem>
      <NavItem onClick={() => setGameState('SWAP')}>Swap</NavItem>
      <NavItem onClick={() => setGameState('REFERRALS')}>Referrals</NavItem>
    </NavContainer>
  );
};

const NavContainer = styled.div`
  display: flex;
  justify-content: space-around;
  background: #4CAF50;
  padding: 10px;
`;

const NavItem = styled.div`
  color: white;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default BottomNavigation; 