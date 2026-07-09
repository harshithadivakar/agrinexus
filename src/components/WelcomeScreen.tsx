import React, { useState } from 'react';
import { Leaf, ArrowRight, LogIn, UserPlus, HelpCircle, Loader2 } from 'lucide-react';
import { signUpWithSupabase, signInWithSupabase, checkSupabaseConnection } from '../supabase';

interface WelcomeScreenProps {
  onNext: (userEmail: string, userName: string) => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const [mode, setMode] = useState<'welcome' | 'signin' | 'signup'>('welcome');
  const [email, setEmail] = useState('harshithadivakar@student.ie.edu');
  const [name, setName] = useState('Harshitha');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please enter your name.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        if (mode === 'signup') {
          setInfoMessage('Creating your Supabase account...');
          const signUpData = await signUpWithSupabase(email, name, password);
          if (!signUpData.session) {
            // Email confirmation is required before a session is issued - don't log the user in yet.
            setInfoMessage('');
            setError('Account created! Please check your email to confirm your address, then sign in.');
            setMode('signin');
            setIsLoading(false);
            return;
          }
          setInfoMessage('Account created successfully! Connecting...');
          onNext(email, name || 'User');
        } else {
          setInfoMessage('Signing in via Supabase...');
          const authData = await signInWithSupabase(email, password);
          const userNameFromMeta = authData.user?.user_metadata?.full_name || 'User';
          setInfoMessage('Authenticated successfully! Loading your garden...');
          onNext(email, userNameFromMeta);
        }
      } else {
        // Fallback gracefully to offline mode if Supabase keys are not set yet
        setInfoMessage('Supabase keys not configured in .env. Falling back to Local Preview mode...');
        setTimeout(() => {
          onNext(email, name || 'User');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Supabase Auth Error:', err);
      setError(err.message || 'An authentication error occurred. Please check your credentials or Supabase setup.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          alt="AgriNexus Countertop Garden"
          className="w-full h-full object-cover select-none scale-105 transition-all duration-1000"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQWdNc7gmLVKTtiWxp8JTqtqVoZx8oeokM3suGjRscEE7PEkMX_N37cyPRXcehoK5BRMYeqdqwxMenlc_7RzGUNC3gLGH-37XI9IbGJsfesESar73L8j6FgMT1tf94Dlr0bIMhG4GtKnlI75WfCkjLwLCwKQCwzQy04bADuMJ5j22kuzS25m69PYxhkmOCppy1ZWHS35rULCr5j-rjTtv3mwnIQ0thMPybymo5gNRSjj_awLBtHBDb1gmwqo9X5b3u7wNGnRaPjpdJ"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Top App Bar */}
      <header className="absolute top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6DDBA0] text-[28px]">potted_plant</span>
          <span className="font-heading text-[22px] font-extrabold tracking-tight text-white">AgriNexus</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="text-white/80 hover:bg-white/10 transition-colors duration-200 p-2 rounded-full active:opacity-80"
            aria-label="Help"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
          
          {isHelpOpen && (
            <div className="absolute right-0 mt-2 w-72 p-4 bg-[#162019]/95 backdrop-blur-md border border-[#3c4a41] rounded-2xl shadow-xl text-white text-xs z-50">
              <h4 className="font-heading font-semibold text-sm mb-1 text-[#6DDBA0]">Welcome to AgriNexus</h4>
              <p className="text-white/80 leading-relaxed mb-2">
                This companion application connects seamlessly to your countertop smart garden to automatically regulate growth routines.
              </p>
              <p className="text-white/60">
                Created for urban spaces to provide fresh herbs and greens with zero hassle.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Content Overlay */}
      <main className="relative z-10 w-full">
        <div className="glass-panel w-full pt-10 pb-8 px-6 rounded-t-[32px] border-t border-white/20">
          <div className="max-w-md mx-auto w-full">
            {mode === 'welcome' && (
              <div className="space-y-6">
                <div className="space-y-3 text-center">
                  <h1 className="font-heading text-3xl md:text-4xl text-white font-extrabold leading-[1.1] drop-shadow-md">
                    Grow fresh herbs at your fingertips.
                  </h1>
                  <p className="font-sans text-base text-white/90 max-w-[320px] mx-auto leading-relaxed">
                    The aesthetic countertop garden for your home.
                  </p>
                </div>

                {/* Action Cluster */}
                <div className="flex flex-col gap-4 w-full">
                  <button
                    onClick={() => setMode('signup')}
                    id="welcome-create-account-btn"
                    className="w-full h-[58px] bg-[#42b649] text-[#e7f6ee] font-heading font-bold text-base rounded-full shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#52c659]"
                  >
                    Create My Account
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setMode('signin')}
                    id="welcome-signin-btn"
                    className="w-full h-[58px] border border-white/30 text-white font-heading font-semibold text-base rounded-full active:bg-white/10 transition-all duration-200 backdrop-blur-sm hover:border-white/50"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center">
                  <h2 className="font-heading text-2xl text-white font-bold mb-1">
                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-white/70 text-xs">
                    {mode === 'signin' 
                      ? 'Access your active countertop crops' 
                      : 'Get started with your fresh home harvests'}
                  </p>
                </div>

                 {error && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs text-center">
                    {error}
                  </div>
                )}

                {infoMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs text-center animate-pulse">
                    {infoMessage}
                  </div>
                )}

                <div className="space-y-3">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-white/70 text-[11px] uppercase tracking-wider font-semibold mb-1 ml-1">Full Name</label>
                      <input
                        type="text"
                        disabled={isLoading}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Harshitha"
                        id="welcome-name-input"
                        className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#6DDBA0] focus:ring-1 focus:ring-[#6DDBA0] text-sm disabled:opacity-55"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-white/70 text-[11px] uppercase tracking-wider font-semibold mb-1 ml-1">Email Address</label>
                    <input
                      type="email"
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      id="welcome-email-input"
                      className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#6DDBA0] focus:ring-1 focus:ring-[#6DDBA0] text-sm disabled:opacity-55"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-[11px] uppercase tracking-wider font-semibold mb-1 ml-1">Password</label>
                    <input
                      type="password"
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      id="welcome-password-input"
                      className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#6DDBA0] focus:ring-1 focus:ring-[#6DDBA0] text-sm disabled:opacity-55"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    id="welcome-submit-btn"
                    className="w-full h-12 bg-[#6DDBA0] text-[#0F1612] font-heading font-bold text-sm rounded-full shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#82d8a3] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                      </>
                    ) : mode === 'signin' ? (
                      <>
                        <LogIn className="w-4 h-4" /> Sign In
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Register & Begin
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setMode('welcome');
                      setError('');
                      setInfoMessage('');
                    }}
                    className="w-full text-center text-white/60 hover:text-white text-xs py-1 disabled:opacity-50"
                  >
                    Back to Intro
                  </button>
                </div>
              </form>
            )}

            {/* Integrated Tagline */}
            <div className="mt-8 text-center">
              <p className="font-sans text-xs text-white/60 flex items-center justify-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#6DDBA0]" />
                Sustainable urban living made simple
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
