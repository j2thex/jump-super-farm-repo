'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import styled-components dynamically to avoid SSR issues
const StyledComponents = dynamic(() => import('./styled'), { ssr: false });

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Import WebApp dynamically to avoid SSR issues
    const initWebApp = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
      } catch (error) {
        console.error('Failed to initialize WebApp:', error);
      }
    };
    
    initWebApp();
  }, []);

  // Don't render anything until we're on the client
  if (!isClient) {
    return null;
  }

  return <StyledComponents />;
}