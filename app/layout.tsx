import StyledComponentsRegistry from './registry';
import ClientLayout from './ClientLayout';

export const metadata = {
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
      <body>
        <StyledComponentsRegistry>
          <ClientLayout>{children}</ClientLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
