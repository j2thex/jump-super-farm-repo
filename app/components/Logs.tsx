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
        Console {isCollapsed ? '▼' : '▲'}
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
  bottom: 60px;  // Adjusted to account for bottom navigation
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  font-family: monospace;
  z-index: 1000;
  max-width: 600px;
  margin: 0 auto;
`;

const LogsHeader = styled.div`
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.9);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border-top: 1px solid #333;

  &:hover {
    background: rgba(0, 0, 0, 1);
  }
`;

const LogsContent = styled.div<{ isCollapsed: boolean }>`
  max-height: ${props => props.isCollapsed ? '0' : '200px'};
  overflow-y: auto;
  transition: max-height 0.3s ease-in-out;
  scrollbar-width: thin;
  scrollbar-color: #00ff00 #000;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #000;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #00ff00;
    border-radius: 3px;
  }
`;

const LogEntry = styled.div`
  padding: 2px 10px;
  border-bottom: 1px solid #333;
  font-size: 0.9em;
  
  &:last-child {
    border-bottom: none;
  }
`;

export default Logs; 