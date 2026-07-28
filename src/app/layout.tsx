import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import CartDrawer from '@/components/CartDrawer/CartDrawer';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'RAM — Grade Cold Wear | Built For Cold',
  description:
    'RAM Arctic Division. Futuristic tech-wear and winter gear engineered for sub-zero dominance. Puffer jackets, expedition coats, and extreme cold systems built to endure.',
  keywords: 'RAM, tech-wear, winter gear, puffer jacket, cold weather, arctic, expedition',
  openGraph: {
    title: 'RAM — Grade Cold Wear',
    description: 'Futuristic tech-wear engineered for sub-zero dominance.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
