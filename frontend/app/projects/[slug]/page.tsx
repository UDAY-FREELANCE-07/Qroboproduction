'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, DollarSign, Wrench, ArrowRight, Check, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectComponent = Database['public']['Tables']['project_components']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [project, setProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<(ProjectComponent & { product: Product | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: proj } = await dataClient
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      setProject(proj);

      if (proj) {
        const { data: comps } = await dataClient
          .from('project_components')
          .select('*, product:products(*)')
          .eq('project_id', proj.id);
        setComponents((comps as any) || []);
      }
      setIsLoading(false);
    };
    load();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Skeleton className="h-80 rounded-xl mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy mb-4">Project not found</h1>
        <Link href="/projects"><Button>Back to Projects</Button></Link>
      </div>
    );
  }

  const addAllToCart = async () => {
    const validComponents = components.filter((c) => c.product);
    for (const comp of validComponents) {
      if (comp.product) {
        await addItem(comp.product, comp.quantity);
      }
    }
    toast.success(`${validComponents.length} items added to cart`);
  };

  const totalCost = components.reduce((sum, c) => sum + (c.product ? c.product.price * c.quantity : 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      {project.image_url && (
        <div className="aspect-video rounded-xl overflow-hidden mb-6">
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}

      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-navy">Home</Link>
        <span>/</span>
        <Link href="/projects" className="hover:text-navy">Projects</Link>
        <span>/</span>
        <span className="text-navy font-medium">{project.title}</span>
      </nav>

      <div className="flex items-center gap-3 mb-4">
        <span className={cn(
          'text-xs font-semibold px-2 py-1 rounded-md',
          project.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
          project.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        )}>
          {project.difficulty}
        </span>
        {project.estimated_time && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-4 h-4" /> {project.estimated_time}
          </span>
        )}
        {project.estimated_cost && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> ~{formatPrice(project.estimated_cost)}
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold text-navy mb-4">{project.title}</h1>
      <p className="text-muted-foreground mb-6">{project.description}</p>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag, i) => (
            <span key={i} className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Tutorial */}
      {project.tutorial && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-navy mb-4">Tutorial</h2>
          <div className="prose max-w-none">
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{project.tutorial}</p>
          </div>
        </div>
      )}

      {/* Components */}
      {components.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-navy">Required Components</h2>
            </div>
            <Button onClick={addAllToCart} size="sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>
          </div>
          <div className="space-y-3">
            {components.map((comp) => (
              <div key={comp.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                {comp.product?.primary_image ? (
                  <img src={comp.product.primary_image} alt={comp.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  {comp.product ? (
                    <Link href={`/product/${comp.product.slug}`} className="text-sm font-medium text-navy hover:text-primary">
                      {comp.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-navy">{comp.name}</span>
                  )}
                  <p className="text-xs text-muted-foreground">Quantity: {comp.quantity}</p>
                </div>
                {comp.product && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-navy">{formatPrice(comp.product.price * comp.quantity)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 h-7 text-xs"
                      onClick={async () => { await addItem(comp.product!, comp.quantity); toast.success('Added to cart'); }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between">
            <span className="font-bold text-navy">Total Cost</span>
            <span className="font-bold text-navy">{formatPrice(totalCost)}</span>
          </div>
        </div>
      )}

      <Link href="/projects">
        <Button variant="outline">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Projects
        </Button>
      </Link>
    </div>
  );
}
