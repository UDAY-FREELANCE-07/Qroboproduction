'use client';

import Link from 'next/link';
import { Cpu, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Github } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: 'Robotics', href: '/shop?category=robotics' },
    { label: 'Development Boards', href: '/shop?category=development-boards' },
    { label: 'Sensors', href: '/shop?category=sensors' },
    { label: '3D Printing', href: '/shop?category=3d-printing' },
    { label: 'DIY Kits', href: '/shop?category=diy-kits' },
    { label: 'Tools', href: '/shop?category=tools' },
  ],
  company: [
    { label: 'About Us', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Learn', href: '/learn' },
    { label: 'Deals', href: '/deals' },
  ],
  support: [
    { label: 'My Account', href: '/account' },
    { label: 'My Orders', href: '/account?tab=orders' },
    { label: 'Wishlist', href: '/account?tab=wishlist' },
    { label: 'Cart', href: '/cart' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-20">
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Qrobo</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs mb-4">
              Your one-stop shop for electronics, robotics, maker hardware, and DIY project kits. Build something amazing with Qrobo.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> support@qrobo.in
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +91 98765 43210
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Bengaluru, India
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            (c) {new Date().getFullYear()} Qrobo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
