import './globals.css';
import { Manrope } from 'next/font/google';
import LiquidBackground from '@/components/LiquidBackground';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata = { title: 'DeviceHub' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={manrope.variable}>
      <body className="font-sans antialiased">
        <LiquidBackground />
        {children}
      </body>
    </html>
  );
}
