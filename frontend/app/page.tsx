'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Clock, Star, Quote, Flame, Gift, Percent, Rocket, Sparkles, ShieldCheck, Truck, BadgePercent, Wrench, RotateCcw, Bot, Zap } from 'lucide-react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { ProductCard } from '@/components/product/product-card';
import { NewsletterForm } from '@/components/home/newsletter-form';
import { Button } from '@/components/ui/button';
import { formatPrice, timeLeftUntil } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Product = Database['public']['Tables']['products']['Row'];
type Banner = Database['public']['Tables']['banners']['Row'];
type PromoCard = Database['public']['Tables']['promo_cards']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Tutorial = Database['public']['Tables']['tutorials']['Row'];

const reviews = [
  { name: 'Rahul Sharma', role: 'Engineering Student', rating: 5, text: 'Qrobo has been my go-to for all electronics projects. The quality of components and fast delivery is unmatched. The Arduino starter kit is perfect for beginners!' },
  { name: 'Priya Patel', role: 'Maker & Hobbyist', rating: 5, text: 'Amazing selection of sensors and modules. The website is easy to navigate and the product descriptions are very detailed. Highly recommend for DIY enthusiasts.' },
  { name: 'Arun Kumar', role: 'Robotics Educator', rating: 5, text: 'I buy all my robotics kit supplies from Qrobo for my workshops. The quality is consistent and the prices are very competitive. The project guides are a great bonus.' },
  { name: 'Sneha Reddy', role: '3D Printing Enthusiast', rating: 4, text: 'Great selection of 3D printing supplies. The PLA filament quality is excellent and the prices are better than other stores. Fast shipping too!' },
];

export default function HomePage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promoCards, setPromoCards] = useState<PromoCard[]>([]);
  const [deals, setDeals] = useState<(Deal & { product: Product })[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [roboticsProducts, setRoboticsProducts] = useState<Product[]>([]);
  const [devBoardProducts, setDevBoardProducts] = useState<Product[]>([]);
  const [sensorProducts, setSensorProducts] = useState<Product[]>([]);
  const [arduinoProducts, setArduinoProducts] = useState<Product[]>([]);
  const [threeDProducts, setThreeDProducts] = useState<Product[]>([]);
  const [diyProducts, setDiyProducts] = useState<Product[]>([]);
  const [studentProducts, setStudentProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [
        bannersRes, promoRes, dealsRes,
        featuredRes, bestSellerRes, newArrivalRes,
        roboticsRes, devBoardRes, sensorRes, arduinoRes,
        threeDRes, diyRes, studentRes, projectsRes, tutorialsRes
      ] = await Promise.all([
        dataClient.from('banners').select('*').eq('is_active', true).order('sort_order'),
        dataClient.from('promo_cards').select('*').eq('is_active', true).order('sort_order'),
        dataClient.from('deals').select('*, product:products(*)').eq('is_active', true).limit(8),
        dataClient.from('products').select('*').eq('is_featured', true).eq('is_published', true).limit(10),
        dataClient.from('products').select('*').eq('is_bestseller', true).eq('is_published', true).limit(10),
        dataClient.from('products').select('*').eq('is_new_arrival', true).eq('is_published', true).limit(10),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'robot-chassis-and-platform-kits').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'development-boards-and-shields').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'sensors-temperature-humidity-and-pressure').maybeSingle()).data?.id, (await dataClient.from('categories').select('id').eq('slug', 'sensors-distance').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'microcontroller-chips').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'power-modules').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'diy-and-educational-project-kits').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'motors-actuators-and-sound').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('projects').select('*').eq('is_published', true).limit(6),
        dataClient.from('tutorials').select('*').eq('is_published', true).limit(6),
      ]);

      setBanners(bannersRes.data || []);
      setPromoCards(promoRes.data || []);
      setDeals((dealsRes.data as any) || []);
      setFeaturedProducts(featuredRes.data || []);
      setBestSellers(bestSellerRes.data || []);
      setNewArrivals(newArrivalRes.data || []);
      setRoboticsProducts(roboticsRes.data || []);
      setDevBoardProducts(devBoardRes.data || []);
      setSensorProducts(sensorRes.data || []);
      setArduinoProducts(arduinoRes.data || []);
      setThreeDProducts(threeDRes.data || []);
      setDiyProducts(diyRes.data || []);
      setStudentProducts(studentRes.data || []);
      setProjects(projectsRes.data || []);
      setTutorials(tutorialsRes.data || []);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-4">
        <div className="no-scrollbar mb-6 flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-[400px] w-[270px] shrink-0 rounded-xl" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="skeleton-shimmer h-80 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-6">
      <HeroCarousel banners={banners} />
      <TrustBar />
      <div className="h-3" />

      {/* Campaign spotlight - Decent vibes modern layout with hardware visuals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Super Deals (Arduino & Microcontrollers) */}
          <Link
            href="/deals"
            className="group relative min-h-[200px] overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sky-50/60 to-blue-50/80 p-5 sm:p-6 border border-blue-200/80 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-xl flex flex-col justify-between"
          >
            {/* Tech grid & glow accents */}
            <div className="absolute inset-0 campaign-grid-blue opacity-40 pointer-events-none" />
            <div className="absolute top-0 right-0 w-44 h-44 bg-blue-300/15 rounded-full blur-2xl pointer-events-none" />

            {/* Hardware cutout image on the right */}
            <div className="absolute -right-3 -bottom-3 w-40 sm:w-44 h-36 sm:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white/90 transform rotate-[-4deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 select-none">
              <img
                src="https://images.pexels.com/photos/35673120/pexels-photo-35673120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Microcontrollers & Arduino Deals"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Floating -45% Discount badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-[#FF4D00] text-white text-[11px] font-black h-8 w-8 rounded-full flex items-center justify-center shadow-md animate-pulse">
                -45%
              </span>
            </div>

            {/* Text & Action */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                  <Flame className="h-3 w-3 text-amber-300 fill-amber-300" /> Hot Right Now
                </span>
                <h3 className="mt-3 text-2xl sm:text-3xl font-black text-navy tracking-tight leading-none">
                  SUPER<br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">DEALS</span>
                </h3>
                <p className="mt-1 text-xs text-muted-foreground font-medium max-w-[150px] sm:max-w-[160px] leading-relaxed">
                  Sensors, ICs & dev boards starting at ₹3
                </p>
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-1.5 text-xs font-bold text-white shadow-sm group-hover:bg-blue-600 transition-colors">
                  Shop deals <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Robotics & STEM DIY Kits */}
          <Link
            href="/shop?category=robotics"
            className="group relative min-h-[200px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-5 sm:p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
          >
            {/* Tech grid & energy accents */}
            <div className="absolute inset-0 campaign-grid opacity-20 pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Hardware cutout image on the right */}
            <div className="absolute -right-3 -bottom-3 w-40 sm:w-44 h-36 sm:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 transform rotate-[4deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 select-none">
              <img
                src="https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Robotics & DIY Kits"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent" />
            </div>

            {/* Floating STEM badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-cyan-400 text-blue-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                <Bot className="w-3 h-3" /> STEM
              </span>
            </div>

            {/* Text & Action */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200 border border-white/20 shadow-sm">
                  <Rocket className="h-3 w-3" /> Robotics & DIY
                </span>
                <h3 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  BUILD &<br />
                  <span className="text-cyan-200">INNOVATE</span>
                </h3>
                <p className="mt-1 text-xs text-blue-100 font-medium max-w-[150px] sm:max-w-[160px] leading-relaxed">
                  Chassis, motors, drivers & learning kits
                </p>
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-md group-hover:bg-cyan-50 transition-colors">
                  Explore kits <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 3: 3D Printing & New Drops */}
          <Link
            href="/shop?category=3d-printing"
            className="group relative min-h-[200px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#1E293B] p-5 sm:p-6 text-white border border-slate-700/60 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/50 hover:shadow-xl flex flex-col justify-between"
          >
            {/* Tech grid & cyber cyan accents */}
            <div className="absolute inset-0 campaign-grid opacity-25 pointer-events-none" />
            <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Hardware cutout image on the right */}
            <div className="absolute -right-3 -bottom-3 w-40 sm:w-44 h-36 sm:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-cyan-500/30 transform rotate-[-3deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 select-none">
              <img
                src="https://images.pexels.com/photos/33977799/pexels-photo-33977799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="3D Printing & New Drops"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Floating New Drop badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-amber-400 text-navy text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                NEW 2026
              </span>
            </div>

            {/* Text & Action */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-300 border border-cyan-400/30 shadow-sm">
                  <Sparkles className="h-3 w-3" /> Fresh Drop
                </span>
                <h3 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  3D TOYS &<br />
                  <span className="text-cyan-300">PRINT LAB</span>
                </h3>
                <p className="mt-1 text-xs text-gray-300 font-medium max-w-[150px] sm:max-w-[160px] leading-relaxed">
                  Filaments, 3D printers & IoT modules
                </p>
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md group-hover:from-cyan-400 group-hover:to-blue-500 transition-all">
                  See arrivals <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Daily Deals */}
      {deals.length > 0 && (
        <Section title="Daily Deals" subtitle="Limited time offers - grab them before they're gone" link="/deals" linkLabel="View all deals">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {deals.slice(0, 4).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </Section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <Section title="Best Sellers" subtitle="Our most popular products chosen by makers like you" link="/shop?sort=popularity" linkLabel="View all">
          <ProductRow products={bestSellers} />
        </Section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <Section title="New Arrivals" subtitle="The latest additions to our catalog" link="/shop?sort=newest" linkLabel="View all">
          <ProductRow products={newArrivals} />
        </Section>
      )}

      {/* Robotics & Automation */}
      {roboticsProducts.length > 0 && (
        <Section title="Robotics & Automation" subtitle="Build robots with our robotics kits and components" link="/shop?category=robotics" linkLabel="View all">
          <ProductRow products={roboticsProducts} />
        </Section>
      )}

      {/* Development Boards */}
      {devBoardProducts.length > 0 && (
        <Section title="Development Boards" subtitle="Microcontroller and single-board computers for every project" link="/shop?category=development-boards" linkLabel="View all">
          <ProductRow products={devBoardProducts} />
        </Section>
      )}

      {/* Sensors & Modules */}
      {sensorProducts.length > 0 && (
        <Section title="Sensors & Modules" subtitle="Detect and measure the world around your projects" link="/shop?category=sensors" linkLabel="View all">
          <ProductRow products={sensorProducts} />
        </Section>
      )}

      {/* Arduino / ESP / Raspberry Pi */}
      {arduinoProducts.length > 0 && (
        <Section title="Arduino & Development Boards" subtitle="Official Arduino boards and compatible alternatives" link="/shop?category=arduino" linkLabel="View all">
          <ProductRow products={arduinoProducts} />
        </Section>
      )}

      {/* 3D Printing */}
      {threeDProducts.length > 0 && (
        <Section title="3D Printing" subtitle="3D printers, filament, and upgrade parts" link="/shop?category=3d-printing" linkLabel="View all">
          <ProductRow products={threeDProducts} />
        </Section>
      )}

      {/* 3D Printing Toys */}
      {threeDProducts.length > 0 && (
        <Section title="3D Printing Toys & Figures" subtitle="Fun 3D-printed toys, figurines, and creative prints" link="/shop?category=3d-printing" linkLabel="View all">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {threeDProducts.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      )}

      {/* DIY Project Kits */}
      {diyProducts.length > 0 && (
        <Section title="DIY Project Kits" subtitle="Complete kits with everything you need to build amazing projects" link="/shop?category=diy-kits" linkLabel="View all">
          <ProductRow products={diyProducts} />
        </Section>
      )}

      {/* Student Project Products */}
      {studentProducts.length > 0 && (
        <Section title="Student Project Products" subtitle="Educational kits perfect for school and college projects" link="/shop?category=student-project-kits" linkLabel="View all">
          <ProductRow products={studentProducts} />
        </Section>
      )}

      {/* Recommended Products */}
      {featuredProducts.length > 0 && (
        <Section title="Recommended For You" subtitle="Handpicked products we think you'll love" link="/shop" linkLabel="View all">
          <ProductRow products={featuredProducts} />
        </Section>
      )}

      {/* Projects / Tutorials */}
      {projects.length > 0 && (
        <Section title="Projects & Tutorials" subtitle="Learn and build with our curated project guides" link="/projects" linkLabel="Browse all projects">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((project) => (
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
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-md',
                      project.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      project.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {project.difficulty}
                    </span>
                    {project.estimated_cost && (
                      <span className="text-xs text-muted-foreground">~{formatPrice(project.estimated_cost)}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-navy mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Learn Section */}
      {tutorials.length > 0 && (
        <Section title="Learn" subtitle="Expand your knowledge with our tutorials and guides" link="/learn" linkLabel="Browse all tutorials">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.slice(0, 3).map((tutorial) => (
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
                <div className="p-4">
                  <span className="text-xs font-semibold text-primary">{tutorial.category}</span>
                  <h3 className="text-sm font-bold text-navy mb-1 group-hover:text-primary transition-colors">{tutorial.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{tutorial.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{tutorial.read_time} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Customer Reviews */}
      <Section title="Customer Reviews" subtitle="What our customers say about Qrobo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((review, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-5 bg-white">
              <Quote className="w-8 h-8 text-blue-100 mb-3" />
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-4">{review.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section id="newsletter" className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-blue-900 to-navy p-8 sm:p-12 text-center">
          <div className="absolute inset-0 campaign-grid opacity-15" />
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full border-[14px] border-blue-400/15 campaign-float" />
          <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full border-[16px] border-yellow-300/10 campaign-float" style={{ animationDelay: '1s' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-300 mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Qrobo insider
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Stay Updated</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Subscribe to our newsletter for the latest products, deals, and project tutorials
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, subtitle, link, linkLabel, children }: {
  title: string;
  subtitle?: string;
  link?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5 border border-gray-100">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy sm:text-xl">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {link && linkLabel && (
            <Link href={link} className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
              {linkLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Horizontally scrolling product carousel with arrow buttons. */
function ProductRow({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Scroller scrollRef={ref}>
      <div ref={ref} className="no-scrollbar flex snap-x gap-3 overflow-x-auto scroll-smooth pb-1">
        {products.map((product) => (
          <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[220px] lg:w-[230px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </Scroller>
  );
}

/** Wraps a horizontal scroll area with left/right arrow buttons (desktop). */
function Scroller({ scrollRef, children, tall = false }: { scrollRef: React.RefObject<HTMLDivElement | null>; children: React.ReactNode; tall?: boolean }) {
  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };
  const btn = cn(
    'absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center bg-white/95 text-navy shadow-lg ring-1 ring-black/5 transition hover:bg-white md:flex',
    tall ? 'h-24 w-11 rounded-md' : 'h-11 w-11 rounded-full'
  );
  return (
    <div className="relative">
      <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)} className={cn(btn, 'left-1')}>
        <ChevronLeft className="h-6 w-6" />
      </button>
      {children}
      <button type="button" aria-label="Scroll right" onClick={() => scroll(1)} className={cn(btn, 'right-1')}>
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}

const HERO_INTERVAL_MS = 5000;

/**
 * Full-width hero carousel built from the existing banners.
 * Slides horizontally; on each slide the badge pops, the title words rise one by one,
 * the text and button slide in, and the image glides in with a slow zoom. Autoplay pauses on hover.
 */
function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setTimeout(() => setCurrent((p) => (p + 1) % banners.length), HERO_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [banners.length, paused, current]);

  if (!banners.length) return null;
  const go = (d: 1 | -1) => setCurrent((p) => (p + d + banners.length) % banners.length);
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <section
      className="relative h-[300px] w-full overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-violet-50 sm:h-[380px] lg:h-[440px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Slide track */}
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, i) => {
          const active = i === current;
          const words = banner.title.split(' ');
          return (
            <div key={banner.id} className="relative h-full w-full shrink-0" aria-hidden={!active}>
              {/* Decorative background */}
              <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl campaign-float" />
              <div className="pointer-events-none absolute bottom-0 right-1/3 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl campaign-float" style={delay(1500)} />

              <div className="grid h-full grid-cols-1 md:grid-cols-2">
                {/* Copy */}
                <div className="relative z-10 flex flex-col justify-center px-6 sm:px-12 lg:px-20">
                  <div className="pointer-events-none absolute left-4 top-6 hidden grid-cols-6 gap-1.5 opacity-40 md:grid">
                    {Array.from({ length: 24 }).map((_, k) => <span key={k} className="h-1 w-1 rounded-full bg-indigo-400" />)}
                  </div>
                  {banner.category_label && (
                    <span
                      className={cn('mb-3 inline-flex w-fit items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-navy shadow', active && 'hero-pop')}
                      style={delay(100)}
                    >
                      <Flame className="h-3.5 w-3.5" /> {banner.category_label}
                    </span>
                  )}
                  <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-navy sm:text-5xl lg:text-6xl">
                    {words.map((word, w) => (
                      <span
                        key={w}
                        className={cn('inline-block', w === 1 && 'text-indigo-600', active && 'hero-rise')}
                        style={delay(250 + w * 120)}
                      >
                        {word}&nbsp;
                      </span>
                    ))}
                  </h1>
                  {banner.description && (
                    <p
                      className={cn('mt-3 max-w-md text-sm text-gray-600 line-clamp-2 sm:text-base', active && 'hero-slide-right')}
                      style={delay(300 + words.length * 120)}
                    >
                      {banner.description}
                    </p>
                  )}
                  <Link
                    href={banner.cta_link}
                    tabIndex={active ? 0 : -1}
                    className={cn(
                      'group mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-indigo-700 py-2 pl-6 pr-2 text-base font-bold uppercase text-white shadow-lg shadow-indigo-700/30 transition hover:scale-105 hover:bg-indigo-800 sm:text-lg',
                      active && 'hero-slide-right'
                    )}
                    style={delay(450 + words.length * 120)}
                  >
                    {banner.cta_text}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-indigo-700">
                      <ArrowRight className="hero-arrow h-5 w-5" />
                    </span>
                  </Link>
                </div>

                {/* Image */}
                <div className={cn('relative hidden overflow-hidden md:block', active && 'hero-image-in')} style={delay(150)}>
                  {banner.image_url && (
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className={cn('h-full w-full object-cover [mask-image:linear-gradient(to_right,transparent,black_25%)]', active && 'hero-kenburns')}
                    />
                  )}
                  <div className={cn('absolute right-8 top-8', active && 'hero-pop')} style={delay(700)}>
                    <div className="campaign-float">
                      <div className="campaign-pulse rotate-6 rounded-xl bg-indigo-700 px-4 py-2 text-center text-white shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">Limited drop</p>
                        <p className="text-2xl font-black leading-none">HOT</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 text-navy/70 transition hover:bg-white/70 hover:text-navy">
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button onClick={() => go(1)} aria-label="Next banner" className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 text-navy/70 transition hover:bg-white/70 hover:text-navy">
            <ChevronRight className="h-7 w-7" />
          </button>
          {/* Dots with autoplay progress */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === current}
                className={cn('relative h-2 overflow-hidden rounded-full transition-all duration-300', i === current ? 'w-10 bg-indigo-200' : 'w-2 bg-indigo-300 hover:bg-indigo-400')}
              >
                {i === current && (
                  <span
                    key={`${current}-${paused}`}
                    className="hero-progress absolute inset-0 rounded-full bg-indigo-700"
                    style={{ animationDuration: `${HERO_INTERVAL_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const trustItems = [
  { icon: ShieldCheck, title: 'Trust & Reliability', text: '100% genuine products. Pan-India delivery.' },
  { icon: Truck, title: 'Free Shipping', text: 'On all orders above Rs 999' },
  { icon: BadgePercent, title: 'Best Price Guarantee', text: 'Got a better price? We try to match it.' },
  { icon: Wrench, title: 'Maker Support', text: 'Project guides and tutorials included' },
  { icon: RotateCcw, title: 'Easy Returns', text: '7-day easy returns & replacement' },
];

function TrustBar() {
  return (
    <section className="w-full border-b border-gray-100 bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-navy">{title}</h3>
              <p className="mt-1 max-w-[12rem] text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DealCard({ deal }: { deal: Deal & { product: Product } }) {
  const [timeLeft, setTimeLeft] = useState(timeLeftUntil(deal.ends_at));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(timeLeftUntil(deal.ends_at)), 1000);
    return () => clearInterval(timer);
  }, [deal.ends_at]);

  if (!deal.product) return null;

  return (
    <Link href={`/product/${deal.product.slug}`}>
      <div className="group bg-white rounded-2xl border border-gray-200/90 overflow-hidden hover:shadow-lg hover:border-sky-400 transition-all flex flex-col justify-between">
        <div className="relative h-44 sm:h-48 w-full bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-4 overflow-hidden rounded-t-2xl">
          {deal.product.primary_image ? (
            <img src={deal.product.primary_image} alt={deal.product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 text-center">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Component</span>
            </div>
          )}
          <span className="absolute top-2.5 left-2.5 bg-[#FF4D00] text-white text-[11px] font-extrabold h-7 w-7 rounded-full flex items-center justify-center shadow-sm">
            -{deal.discount_percentage ?? 0}%
          </span>
        </div>
        <div className="p-3.5 flex flex-col justify-between flex-1">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#1E293B] line-clamp-2 min-h-[36px] mb-2 leading-snug">{deal.product.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm sm:text-base font-bold text-red-600">{formatPrice(deal.sale_price)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(deal.original_price)}</span>
            </div>
          </div>
          {!timeLeft.expired ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>
          ) : (
            <p className="text-xs text-red-500 font-medium">Deal ended</p>
          )}
        </div>
      </div>
    </Link>
  );
}


