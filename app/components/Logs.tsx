import React from 'react';
import styled from 'styled-components';

const Logs = ({ logs }) => {
  return (
    <LogPanel>
      <LogHeader>
        Debug Logs
        <CopyButton onClick={() => {
          const logText = logs.join('\n');
          copyToClipboard(logText)
            .then(success => addLog(success ? 'Logs copied!' : 'Failed to copy logs'));
        }}>
          📋 Copy Logs
        </CopyButton>
      </LogHeader>
      <LogContent>
        {logs.map((log, index) => (
          <LogEntry key={index}>{log}</LogEntry>
        ))}
      </LogContent>
    </LogPanel>
  );
};

const LogPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  z-index: 1000;
`;

const LogHeader = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #4CAF50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
`;

const LogContent = styled.div`
  display: flex;
  flex-direction: column-reverse;
`;

const LogEntry = styled.div`
  padding: 2px 0;
  font-family: monospace;
  text-align: left;
`;

const CopyButton = styled.button`
  float: right;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #45a049;
  }
  
  &:active {
    background: #3d8b40;
  }
`;

export default Logs; 