'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the game component with no SSR
const Game = dynamic(() => import('./components/Game'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return <Game />;
}