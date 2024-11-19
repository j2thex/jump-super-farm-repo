import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

interface SwapProps {
  gold: number;
  setGold: (gold: number) => void;
  addLog: (message: string) => void;
}

const Swap: React.FC<SwapProps> = ({ gold, setGold, addLog }) => {
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      addLog('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setAccount(address);
      addLog(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error) {
      addLog(`Error connecting wallet: ${(error as Error).message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            addLog(`Wallet connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, [addLog]);

  return (
    <SwapScreen>
      <Header>
        <h2>Swap Gold</h2>
        <GoldBalance>🪙 {gold} Gold</GoldBalance>
      </Header>

      <WalletSection>
        {!account ? (
          <ConnectButton 
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </ConnectButton>
        ) : (
          <WalletInfo>
            <WalletAddress>
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </WalletAddress>
            <DisconnectButton onClick={() => setAccount('')}>
              Disconnect
            </DisconnectButton>
          </WalletInfo>
        )}
      </WalletSection>

      {account && (
        <SwapSection>
          <SwapCard>
            <h3>Swap Gold for Tokens</h3>
            <p>Coming soon!</p>
            <SwapInfo>
              <div>1 Gold = 0.001 ETH</div>
              <div>Minimum swap: 100 Gold</div>
            </SwapInfo>
          </SwapCard>
        </SwapSection>
      )}
    </SwapScreen>
  );
};

const SwapScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

const GoldBalance = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  color: #FFD700;
`;

const WalletSection = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px 0;
`;

const ConnectButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f5f5;
  padding: 10px 20px;
  border-radius: 8px;
`;

const WalletAddress = styled.div`
  font-family: monospace;
  color: #666;
`;

const DisconnectButton = styled.button`
  background: #ff4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;

  &:hover {
    background: #ff0000;
  }
`;

const SwapSection = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px 0;
`;

const SwapCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;

  h3 {
    margin-bottom: 15px;
    color: #333;
  }
`;

const SwapInfo = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 0.9em;
  color: #666;

  div {
    margin: 5px 0;
  }
`;

export default Swap; 