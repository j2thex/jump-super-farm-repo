import type { Metadata } from 'next';
import StyledComponentsRegistry from './registry';

export const metadata: Metadata = {
  title: 'Happy Farmer',
  description: 'A fun farming game for Telegram',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0,
        backgroundColor: 'var(--tg-theme-bg-color, #fff)',
        color: 'var(--tg-theme-text-color, #000)'
      }}>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
