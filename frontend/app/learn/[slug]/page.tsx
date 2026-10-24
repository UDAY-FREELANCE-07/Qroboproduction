'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Tutorial = Database['public']['Tables']['tutorials']['Row'];

export default function TutorialDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dataClient
      .from('tutorials')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data }) => {
        setTutorial(data);
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-60 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy mb-4">Tutorial not found</h1>
        <Link href="/learn"><Button>Back to Learn</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Learn
      </Link>

      <span className="text-xs font-semibold text-primary">{tutorial.category}</span>
      <h1 className="text-3xl font-bold text-navy mb-3">{tutorial.title}</h1>
      <div className="flex items-center gap-3 mb-6">
        <span className={cn(
          'text-xs font-semibold px-2 py-1 rounded-md',
          tutorial.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
          tutorial.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        )}>
          {tutorial.difficulty}
        </span>
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="w-4 h-4" /> {tutorial.read_time} min read
        </span>
      </div>

      {tutorial.image_url && (
        <div className="aspect-video rounded-xl overflow-hidden mb-6">
          <img src={tutorial.image_url} alt={tutorial.title} className="w-full h-full object-cover" />
        </div>
      )}

      <p className="text-muted-foreground mb-6 font-medium">{tutorial.description}</p>

      <div className="prose max-w-none">
        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{tutorial.content}</p>
      </div>

      {tutorial.tags && tutorial.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
          {tutorial.tags.map((tag, i) => (
            <span key={i} className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
