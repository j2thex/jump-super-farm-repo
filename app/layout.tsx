import type { Metadata } from 'next';
import StyledComponentsRegistry from './registry';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Happy Farmer',
  description: 'Farm game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
          onLoad={() => {
            console.log('Telegram WebApp script loaded');
            console.log('Window.Telegram:', window.Telegram);
          }}
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
