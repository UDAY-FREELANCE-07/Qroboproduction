'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { adminService } from '@/lib/admin/admin-service';
import { AdminProduct } from '@/lib/admin/admin-types';
import { EmptyState } from '@/components/admin/EmptyState';
import { Package } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      const data = await adminService.getProductById(id);
      setProduct(data);
      setIsLoading(false);
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-slate-500">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        icon={Package}
        title="Product Not Found"
        description={`We could not locate a hardware product with ID "${id}".`}
        actionLabel="Return to Catalog"
        onAction={() => router.push('/admin/products')}
      />
    );
  }

  return <ProductForm initialData={product} isEditing={true} />;
}
