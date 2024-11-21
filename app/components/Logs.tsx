import React, { useState } from 'react';
import styled from 'styled-components';
import Cookies from 'js-cookie';

interface LogsProps {
  logs: string[];
  addLog: (message: string) => void;
}

const Logs: React.FC<LogsProps> = ({ logs, addLog }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const copyLogs = async () => {
    try {
      const logsText = logs.join('\n');
      await navigator.clipboard.writeText(logsText);
      addLog('📋 Logs copied to clipboard');
    } catch (error) {
      addLog('Failed to copy logs');
    }
  };

  const clearCache = async () => {
    try {
      // Clear cookies
      Cookies.remove('telegramId');
      Cookies.remove('webUserId');
      Cookies.remove('userName');
      
      // Clear localStorage
      localStorage.clear();

      // Clear browser cache for this origin
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys.map(key => caches.delete(key))
        );
      }

      addLog('🧹 Cache cleared! Refresh to start fresh');
      
      // Optional: Show refresh confirmation
      setTimeout(() => {
        if (confirm('Cache cleared. Refresh the page?')) {
          window.location.reload();
        }
      }, 500);
    } catch (error) {
      addLog(`Failed to clear cache: ${error}`);
    }
  };

  return (
    <LogsContainer>
      <LogsHeader>
        <HeaderContent>
          <ConsoleIcon>🖥️</ConsoleIcon>
          <HeaderText>Console</HeaderText>
          <ButtonsContainer>
            <ActionButton onClick={copyLogs} title="Copy Logs">
              <ButtonIcon>📋</ButtonIcon>
              <ButtonLabel>Copy</ButtonLabel>
            </ActionButton>
            <ActionButton onClick={clearCache} title="Clear Cache">
              <ButtonIcon>🧹</ButtonIcon>
              <ButtonLabel>Clear</ButtonLabel>
            </ActionButton>
            <CollapseButton 
              onClick={() => setIsCollapsed(!isCollapsed)}
              $isCollapsed={isCollapsed}
            >
              {isCollapsed ? '▼' : '▲'}
            </CollapseButton>
          </ButtonsContainer>
        </HeaderContent>
      </LogsHeader>
      <LogsContent $isCollapsed={isCollapsed}>
        {logs.map((log, index) => (
          <LogEntry key={index}>{log}</LogEntry>
        ))}
      </LogsContent>
    </LogsContainer>
  );
};

const LogsContainer = styled.div`
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.85);
  color: #00ff00;
  font-family: monospace;
  z-index: 1000;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px 12px 0 0;
  margin-bottom: 10px;
  border: 1px solid rgba(0, 255, 0, 0.2);
  border-bottom: none;
`;

const LogsHeader = styled.div`
  padding: 8px 15px;
  background: rgba(0, 255, 0, 0.1);
  border-radius: 12px 12px 0 0;
  transition: all 0.3s ease;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConsoleIcon = styled.span`
  font-size: 1.1em;
`;

const HeaderText = styled.span`
  font-weight: bold;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 1px;
  flex-grow: 1;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.2);
  color: #00ff00;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 255, 0, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ButtonIcon = styled.span`
  font-size: 1.1em;
`;

const ButtonLabel = styled.span`
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CollapseButton = styled(ActionButton)<{ $isCollapsed: boolean }>`
  padding: 4px;
  min-width: 28px;
  justify-content: center;
`;

const LogsContent = styled.div<{ $isCollapsed: boolean }>`
  max-height: ${props => props.$isCollapsed ? '0' : '150px'};
  overflow-y: auto;
  transition: all 0.3s ease;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 0, 0.5) rgba(0, 0, 0, 0.2);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 255, 0, 0.5);
    border-radius: 3px;
  }
`;

const LogEntry = styled.div`
  padding: 4px 12px;
  border-bottom: 1px solid rgba(0, 255, 0, 0.1);
  font-size: 0.9em;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 255, 0, 0.05);
  }
`;

export default Logs; 