import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Qrobo - Electronics, Robotics & DIY Hardware Store',
  description: 'Shop for robotics kits, development boards, sensors, 3D printers, and DIY project kits. Build something amazing with Qrobo.',
  openGraph: {
    title: 'Qrobo - Electronics, Robotics & DIY Hardware Store',
    description: 'Shop for robotics kits, development boards, sensors, 3D printers, and DIY project kits.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen flex flex-col">
                <AnnouncementBar />
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <CartDrawer />
              <Toaster position="bottom-right" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
