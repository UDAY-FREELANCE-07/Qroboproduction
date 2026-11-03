'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useWishlist } from '@/lib/wishlist-context';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Package, Heart, MapPin, Settings, LogOut, ShoppingBag, ShieldCheck, Trash2, Cpu } from 'lucide-react';
import { ChangePasswordCard, EmailVerificationCard, NotificationsCard, ProfileCard } from '@/components/account/settings-panels';
import { formatPrice, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Address = Database['public']['Tables']['addresses']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, signOut } = useAuth();
  const { wishlistIds, toggle: toggleWishlist } = useWishlist();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(initialTab === 'password' ? 'settings' : initialTab || 'profile');
  const [orders, setOrders] = useState<(Order & { order_items: OrderItem[] })[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const loadData = async () => {
      const [ordersRes, wishlistRes, addrRes] = await Promise.all([
        dataClient
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        dataClient
          .from('wishlists')
          .select('product:products(*)')
          .eq('user_id', user.id),
        dataClient
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      setOrders((ordersRes.data as any) || []);

      let products = (wishlistRes.data?.map((w: any) => w.product).filter(Boolean)) || [];
      if (products.length === 0 && wishlistIds.length > 0) {
        const { data: matched } = await dataClient
          .from('products')
          .select('*')
          .in('id', wishlistIds);
        if (matched && matched.length > 0) {
          products = matched;
        }
      }
      setWishlistProducts(products);
      setAddresses(addrRes.data || []);
    };
    loadData();
  }, [user, router]);

  // Keep wishlistProducts synchronized whenever wishlistIds change
  useEffect(() => {
    if (wishlistIds.length === 0) {
      setWishlistProducts([]);
      return;
    }
    const currentProductIds = new Set(wishlistProducts.map((p) => p.id));
    const missingIds = wishlistIds.filter((id) => !currentProductIds.has(id));

    if (missingIds.length > 0) {
      (async () => {
        const { data } = await dataClient
          .from('products')
          .select('*')
          .in('id', wishlistIds);
        if (data && data.length > 0) {
          setWishlistProducts(data);
        }
      })();
    } else {
      setWishlistProducts((prev) => prev.filter((p) => wishlistIds.includes(p.id)));
    }
  }, [wishlistIds]);

  const handleRemoveFromWishlist = async (productId: string) => {
    await toggleWishlist(productId);
    toast.success('Removed from wishlist');
  };

  if (!user) return null;

  const tabs = [
    { value: 'profile', label: 'Profile', icon: UserIcon },
    { value: 'orders', label: 'Orders', icon: Package },
    { value: 'wishlist', label: 'Wishlist', icon: Heart },
    { value: 'addresses', label: 'Addresses', icon: MapPin },
    { value: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-navy mb-6">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="space-y-1">
          <div className="p-4 bg-white rounded-xl border border-gray-200 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-lg">
                {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                  activeTab === tab.value ? 'bg-primary text-white' : 'text-navy hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{tab.label}</span>
                {tab.value === 'wishlist' && wishlistIds.length > 0 && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    activeTab === 'wishlist' ? 'bg-white text-primary' : 'bg-red-500 text-white'
                  )}>
                    {wishlistIds.length}
                  </span>
                )}
              </button>
            );
          })}
          {profile?.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors">
              <ShieldCheck className="w-4 h-4" />
              Admin dashboard
            </Link>
          )}
          <button
            onClick={async () => { await signOut(); router.push('/'); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileCard showRole={profile?.role === 'admin'} />}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-navy mb-2">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start shopping to place your first order</p>
                  <Link href="/shop"><Button>Start Shopping</Button></Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-navy">Order #{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          'text-xs font-medium px-2 py-1 rounded-full',
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        )}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm font-bold text-navy mt-1">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded object-cover" />
                          )}
                          <span className="flex-1 text-muted-foreground">{item.product_name}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                          <span className="font-medium text-navy">{formatPrice(item.total)}</span>
                        </div>
                      ))}
                    </div>
                    {(order.tracking_number || order.courier) && (
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-blue-50 px-3 py-2 text-xs text-navy">
                        <span className="font-semibold">Shipment</span>
                        {order.courier && <span>{order.courier}</span>}
                        {order.tracking_number && <span>Tracking: <span className="font-mono">{order.tracking_number}</span></span>}
                        {order.tracking_url && /^https:\/\//i.test(order.tracking_url) && (
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                            Track package
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-navy">
                  Wishlist {wishlistProducts.length > 0 && `(${wishlistProducts.length})`}
                </h2>
                {wishlistProducts.length > 0 && (
                  <Link href="/shop" className="text-sm font-semibold text-primary hover:underline">
                    Continue Shopping
                  </Link>
                )}
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-navy mb-2">Your wishlist is empty</h3>
                  <p className="text-sm text-muted-foreground mb-4">Save items you love for later</p>
                  <Link href="/shop"><Button>Browse Products</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlistProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative bg-white rounded-2xl border border-gray-200/90 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-sky-400 transition-all"
                    >
                      {/* Product Image Frame */}
                      <div className="relative aspect-square w-full bg-[#f8f9fa] flex items-center justify-center p-3.5 sm:p-4 overflow-hidden select-none">
                        <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                          {product.primary_image ? (
                            <img
                              src={product.primary_image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <Cpu className="w-10 h-10 text-gray-300" />
                          )}
                        </Link>
                        {/* Remove from wishlist button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromWishlist(product.id);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/95 text-red-500 hover:text-red-700 hover:bg-red-50 shadow-sm border border-gray-100 transition-all"
                          title="Remove from wishlist"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
                        <div>
                          <Link href={`/product/${product.slug}`} className="block">
                            <h3 className="text-sm font-semibold text-navy line-clamp-2 hover:text-primary transition-colors leading-snug">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-base font-extrabold text-red-600">
                              {formatPrice(product.price)}
                            </span>
                            {product.compare_at_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.compare_at_price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stock & Link */}
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                          {product.stock <= 0 ? (
                            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                              Sold out
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              In Stock
                            </span>
                          )}
                          <Link
                            href={`/product/${product.slug}`}
                            className="text-xs font-bold text-primary hover:text-blue-700 hover:underline"
                          >
                            Read More &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-navy mb-2">No saved addresses</h3>
                  <p className="text-sm text-muted-foreground">Addresses are saved during checkout</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-navy">{addr.full_name}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{addr.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{addr.address_line1}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postal_code}</p>
                        <p className="text-sm text-muted-foreground">{addr.phone}</p>
                      </div>
                      {addr.is_default && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <EmailVerificationCard />
              <NotificationsCard admin={profile?.role === 'admin'} />
              <ChangePasswordCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
