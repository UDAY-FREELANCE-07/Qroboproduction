'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/brand/brand-logo';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (phone.trim() && !/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!agreedToTerms) {
      toast.error('Please accept the Terms of Service & Privacy Policy to continue');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName, phone);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created! Welcome to Qrobo!');
      router.push('/account');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8 flex flex-col items-center">
        <BrandLogo size="lg" className="mb-6" />
        <h1 className="text-2xl font-bold text-navy mb-1">Create an account</h1>
        <p className="text-sm text-muted-foreground">Join the Qrobo maker community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="pl-10 text-xs sm:text-sm h-10"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
            Mobile Number (Optional)
          </Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210 (For order SMS/tracking)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 text-xs sm:text-sm h-10"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Used for order delivery coordination & tracking updates.</p>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-xs font-bold text-slate-700">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 text-xs sm:text-sm h-10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="text-xs font-bold text-slate-700">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 pr-10 text-xs sm:text-sm h-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 pr-10 text-xs sm:text-sm h-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terms & Policies Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              required
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="text-primary font-semibold hover:underline">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary font-semibold hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        {/* Marketing / WhatsApp Updates Checkbox */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              checked={receiveUpdates}
              onChange={(e) => setReceiveUpdates(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span>
              Receive order status notifications, maker deals & tech tutorials on WhatsApp / Email.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full h-11 text-xs sm:text-sm font-bold bg-primary hover:bg-blue-700 text-white shadow-sm mt-2" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
          {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-muted-foreground text-xs sm:text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
