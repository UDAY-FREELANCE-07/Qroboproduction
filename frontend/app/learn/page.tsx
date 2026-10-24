'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Tutorial = Database['public']['Tables']['tutorials']['Row'];

export default function LearnPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    dataClient
      .from('tutorials')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTutorials(data || []);
        setIsLoading(false);
      });
  }, []);

  const categories = ['all', ...Array.from(new Set(tutorials.map((t) => t.category)))];
  const filtered = category === 'all' ? tutorials : tutorials.filter((t) => t.category === category);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Learn</h1>
        <p className="text-muted-foreground">Expand your knowledge with our tutorials and guides</p>
      </div>

      {/* Category filter */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              category === cat ? 'bg-primary text-white' : 'bg-gray-100 text-navy hover:bg-gray-200'
            )}
          >
            {cat === 'all' ? 'All Tutorials' : cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No tutorials found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tutorial) => (
            <Link
              key={tutorial.id}
              href={`/learn/${tutorial.slug}`}
              className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              {tutorial.image_url && (
                <div className="aspect-video overflow-hidden bg-gray-50">
                  <img src={tutorial.image_url} alt={tutorial.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                <span className="text-xs font-semibold text-primary">{tutorial.category}</span>
                <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-primary transition-colors">{tutorial.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tutorial.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {tutorial.read_time} min read
                  </span>
                  <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:underline">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
