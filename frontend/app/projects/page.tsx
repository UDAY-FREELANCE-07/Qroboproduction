'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Wrench, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Project = Database['public']['Tables']['projects']['Row'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  useEffect(() => {
    dataClient
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProjects(data || []);
        setIsLoading(false);
      });
  }, []);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.difficulty === filter);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Projects</h1>
        <p className="text-muted-foreground">Explore student electronics and robotics projects with guides and component lists</p>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              filter === level ? 'bg-primary text-white' : 'bg-gray-100 text-navy hover:bg-gray-200'
            )}
          >
            {level}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No projects found for this difficulty level.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              {project.image_url && (
                <div className="aspect-video overflow-hidden bg-gray-50">
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    'text-xs font-semibold px-2 py-1 rounded-md',
                    project.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    project.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {project.difficulty}
                  </span>
                  {project.estimated_time && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {project.estimated_time}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
                <div className="flex items-center justify-between">
                  {project.estimated_cost && (
                    <span className="text-sm font-bold text-navy flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatPrice(project.estimated_cost)}
                    </span>
                  )}
                  <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:underline">
                    View Project <ArrowRight className="w-4 h-4" />
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
