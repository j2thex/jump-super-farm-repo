'use client';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';
import TelegramInitializer from './components/TelegramInitializer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <TelegramInitializer />
      {children}
    </ThemeProvider>
  );
} 