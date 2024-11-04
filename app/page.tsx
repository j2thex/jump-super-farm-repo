'use client';
import { useState } from 'react';

export default function Home() {
  const [silver, setSilver] = useState(10);
  const [crops, setCrops] = useState<number[]>([]);

  const plantCrop = (index: number) => {
    if (silver >= 2 && !crops.includes(index)) {
      setCrops([...crops, index]);
      setSilver(silver - 2);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h1>Happy Farmer</h1>
      <div style={{ marginBottom: '20px' }}>Silver: {silver}</div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '10px',
        maxWidth: '300px',
        margin: '0 auto'
      }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <button
            key={index}
            onClick={() => plantCrop(index)}
            style={{
              width: '80px',
              height: '80px',
              fontSize: '2em',
              border: '2px solid #8B4513',
              borderRadius: '5px',
              cursor: 'pointer',
              background: '#DEB887'
            }}
          >
            {crops.includes(index) ? '🌱' : '🟫'}
          </button>
        ))}
      </div>
    </div>
  );
}