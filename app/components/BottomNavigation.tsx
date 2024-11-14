import React from 'react';
import styled from 'styled-components';

const BottomNavigation = ({ setGameState }) => {
  return (
    <NavContainer>
      <NavItem onClick={() => setGameState('FARM')}>Farm</NavItem>
      <NavItem onClick={() => setGameState('MARKET')}>Market</NavItem>
      <NavItem onClick={() => setGameState('SWAP')}>Swap</NavItem>
      <NavItem onClick={() => setGameState('REFERRALS')}>Referrals</NavItem>
      <NavItem onClick={() => window.open('https://developer.apple.com/design/tips/', '_blank')}>FAQs</NavItem>
    </NavContainer>
  );
};

const NavContainer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background: #f5f5f5;
  border-top: 1px solid #ddd;
`;

const NavItem = styled.div`
  cursor: pointer;
  padding: 10px;
  text-align: center;
  flex: 1;

  &:hover {
    background: #e0e0e0;
  }
`;

export default BottomNavigation; 