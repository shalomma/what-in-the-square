import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'What in the Square · A little room to think',
  description: 'A calm color and shape puzzle. Choose a card, find its square, and play your own way.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
