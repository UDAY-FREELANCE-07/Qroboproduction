'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-8xl font-bold text-primary mb-4">404</div>
      <h1 className="text-2xl font-bold text-navy mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/"><Button><Home className="w-4 h-4 mr-2" /> Go Home</Button></Link>
        <Link href="/shop"><Button variant="outline"><Search className="w-4 h-4 mr-2" /> Browse Products</Button></Link>
      </div>
    </div>
  );
}
