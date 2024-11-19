import React, { useState } from 'react';
import styled from 'styled-components';

interface LogsProps {
  logs: string[];
  addLog: (message: string) => void;
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <LogsContainer>
      <LogsHeader onClick={() => setIsCollapsed(!isCollapsed)}>
        <HeaderContent>
          <ConsoleIcon>🖥️</ConsoleIcon>
          <HeaderText>Console</HeaderText>
          <CollapseIcon isCollapsed={isCollapsed}>
            {isCollapsed ? '▼' : '▲'}
          </CollapseIcon>
        </HeaderContent>
      </LogsHeader>
      <LogsContent isCollapsed={isCollapsed}>
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
  cursor: pointer;
  border-radius: 12px 12px 0 0;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 255, 0, 0.15);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
`;

const CollapseIcon = styled.span<{ isCollapsed: boolean }>`
  transition: transform 0.3s ease;
  transform: ${props => props.isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'};
`;

const LogsContent = styled.div<{ isCollapsed: boolean }>`
  max-height: ${props => props.isCollapsed ? '0' : '150px'};
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