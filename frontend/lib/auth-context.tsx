'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { AppUser as User } from '@/lib/data-client';

interface AuthContextType {
  user: User | null;
  profile: { id: string; full_name: string | null; role: string; phone: string | null } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await dataClient
      .from('profiles')
      .select('id, full_name, role, phone')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await dataClient.auth.getSession();
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('qrobo_mock_customer');
            if (raw) {
              const parsed = JSON.parse(raw);
              setUser(parsed);
              setProfile({
                id: parsed.id,
                full_name: parsed.user_metadata?.full_name || parsed.email?.split('@')[0] || 'Customer',
                role: 'customer',
                phone: '+91 98765 43210',
              });
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = dataClient.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await dataClient.auth.signInWithPassword({ email, password });
    if (res.error && (res.error.message?.includes('demo site') || res.error.message?.includes('disabled'))) {
      const mockCustomer: User = {
        id: 'cust-demo-1',
        email: email,
        email_verified: true,
        user_metadata: { full_name: email.split('@')[0] },
      };
      setUser(mockCustomer);
      setProfile({
        id: mockCustomer.id,
        full_name: email.split('@')[0],
        role: 'customer',
        phone: '+91 98765 43210',
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('qrobo_mock_customer', JSON.stringify(mockCustomer));
      }
      return { error: null };
    }
    return { error: res.error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await dataClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (res.error && (res.error.message?.includes('demo site') || res.error.message?.includes('disabled'))) {
      const mockCustomer: User = {
        id: 'cust-demo-1',
        email: email,
        email_verified: true,
        user_metadata: { full_name: fullName },
      };
      setUser(mockCustomer);
      setProfile({
        id: mockCustomer.id,
        full_name: fullName,
        role: 'customer',
        phone: '+91 98765 43210',
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('qrobo_mock_customer', JSON.stringify(mockCustomer));
      }
      return { error: null };
    }
    return { error: res.error?.message ?? null };
  };

  const signOut = async () => {
    await dataClient.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qrobo_mock_customer');
    }
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, isLoading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
