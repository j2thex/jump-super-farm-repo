'use client';
import React, { useState } from 'react';
import Market from './components/Market';

const MarketPage = () => {
  const [gold, setGold] = useState(0);

  return (
    <div>
      <h1>Market</h1>
      <Market gold={gold} setGold={setGold} />
    </div>
  );
};

export default MarketPage; 