import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
