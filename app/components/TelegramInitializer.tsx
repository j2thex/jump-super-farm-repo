'use client';
import { useEffect } from 'react';

export default function TelegramInitializer() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      console.log('Telegram WebApp loaded:', window.Telegram.WebApp);
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        console.log('Telegram user:', user);
      }
    }
  }, []);

  return null;
} 