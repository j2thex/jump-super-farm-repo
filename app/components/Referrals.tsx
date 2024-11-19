import React, { useState } from 'react';
import styled from 'styled-components';

interface ReferralsProps {
  userId: string;
  addLog: (message: string) => void;
}

interface Referral {
  userId: string;
  level: number;
  date: string;
  earnings: number;
  isActive: boolean;
}

// Mock data - replace with real data from Firestore
const mockReferrals: Referral[] = [
  { userId: 'user1', level: 1, date: '2024-03-15', earnings: 50, isActive: true },
  { userId: 'user2', level: 1, date: '2024-03-14', earnings: 30, isActive: true },
  { userId: 'user3', level: 2, date: '2024-03-13', earnings: 20, isActive: false },
];

const Referrals: React.FC<ReferralsProps> = ({ userId, addLog }) => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://t.me/YourBotName?start=${userId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      addLog('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      addLog('Failed to copy referral link');
    }
  };

  return (
    <ReferralsScreen>
      <Header>
        <h2>Referrals</h2>
      </Header>

      <ReferralLinkSection>
        <h3>Your Referral Link</h3>
        <LinkContainer>
          <LinkText>{referralLink}</LinkText>
          <CopyButton onClick={copyToClipboard}>
            {copied ? '✓ Copied!' : 'Copy'}
          </CopyButton>
        </LinkContainer>
      </ReferralLinkSection>

      <ReferralInfoCard>
        <InfoItem>
          <Label>Total Referrals</Label>
          <Value>{mockReferrals.length}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Active Referrals</Label>
          <Value>{mockReferrals.filter(r => r.isActive).length}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Total Earnings</Label>
          <Value>🪙 {mockReferrals.reduce((sum, r) => sum + r.earnings, 0)}</Value>
        </InfoItem>
      </ReferralInfoCard>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Level</Th>
              <Th>Date</Th>
              <Th>Earnings</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {mockReferrals.map((referral, index) => (
              <TableRow key={index}>
                <Td>{referral.userId}</Td>
                <Td>Level {referral.level}</Td>
                <Td>{referral.date}</Td>
                <Td>🪙 {referral.earnings}</Td>
                <Td>
                  <Status isActive={referral.isActive}>
                    {referral.isActive ? 'Active' : 'Inactive'}
                  </Status>
                </Td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      <ReferralRules>
        <h3>How it works</h3>
        <ul>
          <li>Share your referral link with friends</li>
          <li>Earn 10% of their silver earnings</li>
          <li>Earn 5% from their referrals (Level 2)</li>
          <li>Referrals must be active in the last 7 days</li>
        </ul>
      </ReferralRules>
    </ReferralsScreen>
  );
};

const ReferralsScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

const ReferralLinkSection = styled.div`
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #333;

  h3 {
    margin-bottom: 15px;
    color: #333;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
`;

const LinkText = styled.div`
  flex: 1;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9em;
`;

const CopyButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #45a049;
  }
`;

const ReferralInfoCard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #333;
`;

const InfoItem = styled.div`
  text-align: center;
`;

const Label = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
`;

const Value = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #333;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  background: #e0e0e0;
  color: #333;
  font-weight: bold;
`;

const TableRow = styled.tr`
  background: #f5f5f5;
  
  &:hover {
    background: #e8e8e8;
  }
`;

const Td = styled.td`
  padding: 12px;
  border-top: 1px solid #ddd;
  color: #333;
`;

const Status = styled.span<{ isActive: boolean }>`
  background: ${props => props.isActive ? '#4CAF50' : '#ff4444'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
`;

const ReferralRules = styled.div`
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #333;

  h3 {
    margin-bottom: 15px;
    color: #333;
  }

  ul {
    list-style-type: none;
    padding: 0;

    li {
      margin: 10px 0;
      padding-left: 20px;
      position: relative;
      color: #333;

      &:before {
        content: '•';
        position: absolute;
        left: 0;
        color: #4CAF50;
      }
    }
  }
`;

export default Referrals; 