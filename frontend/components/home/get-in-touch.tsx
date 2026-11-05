'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare, User, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function GetInTouchSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Component & Product Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to submit inquiry');
      }

      setIsSubmitted(true);
      toast.success('Your message has been sent to our team!');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-16 bg-slate-50/60 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3.5 py-1 text-xs font-bold text-blue-700 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> 24/7 Maker Support & Queries
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">
            Get In <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Have a question about component specifications, project guides, or bulk laboratory orders? Send us a message and our engineering team will get back to you promptly.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Direct Contact Channels
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                We're makers just like you. Whether you need wiring pinouts, custom robot kits, or warranty assistance, reach out anytime.
              </p>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors">
                  <div className="rounded-lg bg-blue-600 text-white p-2 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Email Inquiries</div>
                    <a href="mailto:support@qrobo.in" className="text-primary hover:underline font-medium">support@qrobo.in</a>
                    <div className="text-[11px] text-slate-400 mt-0.5">Responses within 2-4 business hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors">
                  <div className="rounded-lg bg-emerald-600 text-white p-2 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Phone & WhatsApp Support</div>
                    <a href="tel:+919876543210" className="text-slate-700 hover:text-emerald-700 font-medium">+91 98765 43210</a>
                    <div className="text-[11px] text-slate-400 mt-0.5">Mon – Sat, 9:00 AM – 7:00 PM IST</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 transition-colors">
                  <div className="rounded-lg bg-amber-600 text-white p-2 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Hub & Warehouse</div>
                    <div className="text-slate-600">Main Distribution Hub & Lab, Hyderabad & Warangal, Telangana, India</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional / Lab orders highlight */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 p-5">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-1.5">
                <Clock className="h-4 w-4 text-indigo-600" /> College Labs & Bulk Orders?
              </div>
              <p className="text-xs text-indigo-800/80 leading-relaxed">
                Looking to order components for university electronics labs, hackathons, or robotics competitions? Mention your institution in the message for bulk quotation discounts.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              {isSubmitted ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">Message Received!</h3>
                  <p className="text-sm text-slate-600 max-w-md mb-6">
                    Thank you for reaching out. We have received your query and sent an acknowledgment to your email. Our technical team will get back to you shortly.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-semibold"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName" className="text-xs font-bold text-slate-700">
                        Your Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="contactName"
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-9 text-xs sm:text-sm h-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contactEmail" className="text-xs font-bold text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="contactEmail"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 text-xs sm:text-sm h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone" className="text-xs font-bold text-slate-700">
                        Phone / WhatsApp (Optional)
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="contactPhone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-9 text-xs sm:text-sm h-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contactSubject" className="text-xs font-bold text-slate-700">
                        Inquiry Topic <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                          id="contactSubject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-transparent text-xs sm:text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-slate-800"
                        >
                          <option value="Component & Product Inquiry">Component & Product Inquiry</option>
                          <option value="Order & Delivery Tracking">Order & Delivery Tracking</option>
                          <option value="Bulk College / Lab Quotation">Bulk College / Lab Quotation</option>
                          <option value="Robotics Project Debugging Help">Robotics Project Debugging Help</option>
                          <option value="Partnership & Vendor Supply">Partnership & Vendor Supply</option>
                          <option value="Other Inquiries">Other Inquiries</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactMessage" className="text-xs font-bold text-slate-700">
                      Message / Requirement Details <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1">
                      <Textarea
                        id="contactMessage"
                        required
                        rows={4}
                        placeholder="Please write your questions, component list, or project details..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="text-xs sm:text-sm resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 h-10 text-xs font-bold bg-primary hover:bg-blue-700 text-white gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      'Sending Message...'
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

