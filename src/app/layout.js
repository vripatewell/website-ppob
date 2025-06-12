import './globals.css';

export const metadata = {
  title: 'PPOB Panel Otomatis',
  description: 'Platform pembelian panel hosting otomatis dengan QRIS OrderKuota.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}