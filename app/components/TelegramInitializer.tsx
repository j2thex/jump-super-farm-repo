'use client';
import { useEffect } from 'react';
import { useTheme } from 'styled-components';

const TelegramInitializer = () => {
  const theme = useTheme();

  useEffect(() => {
    const initTelegram = () => {
      try {
        // Check if running in Telegram
        const telegram = window.Telegram?.WebApp;
        
        if (telegram) {
          console.log('Initializing Telegram WebApp...');
          
          // Tell Telegram WebApp we're ready
          telegram.ready();
          
          // Expand to full height
          telegram.expand();
          
          // Set theme based on Telegram theme
          if (telegram.colorScheme === 'dark') {
            document.documentElement.style.setProperty('color-scheme', 'dark');
          } else {
            document.documentElement.style.setProperty('color-scheme', 'light');
          }
          
          // Listen for theme changes
          telegram.onEvent('themeChanged', () => {
            if (telegram.colorScheme === 'dark') {
              document.documentElement.style.setProperty('color-scheme', 'dark');
            } else {
              document.documentElement.style.setProperty('color-scheme', 'light');
            }
          });

          console.log('Telegram WebApp initialized');
        } else {
          console.log('Not running in Telegram WebApp');
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    };

    initTelegram();
  }, []);

  return null;
};

export default TelegramInitializer; 