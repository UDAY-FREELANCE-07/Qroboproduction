'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDealsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/homepage');
  }, [router]);
  return null;
}
