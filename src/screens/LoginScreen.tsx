import React from 'react';
import { BaseScreenProps } from '../types';
import { Mail, Lock, Eye, ArrowRight, PenTool, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeContext';

export default function LoginScreen({ onNavigate }: BaseScreenProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen flex items-center justify-center p-4 md:p-16 cse-pattern overflow-hidden relative">
      {/* Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-[440px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-surface-container border border-outline-variant rounded-xl p-8 md:p-10 shadow-2xl backdrop-blur-sm"
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-primary-container border border-outline-variant flex items-center justify-center mb-6 relative">
              <PenTool className="text-primary w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary"></div>
            </div>
            <h1 className="text-3xl font-semibold text-on-surface tracking-tight mb-2 text-center">Mock Pass</h1>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest text-center">Premium Civil Service Reviewer</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
            
            {/* Email Field */}
            <div className="space-y-2 group">
              <label className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase" htmlFor="email">Identification (Email)</label>
              <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-outline w-5 h-5" />
                </div>
                <input 
                  className="input-textured w-full bg-transparent border-none pl-10 pr-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base" 
                  id="email" type="email" placeholder="aspirant@gov.ph" required defaultValue="aspirant@gov.ph" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-end ml-1">
                <label className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase" htmlFor="password">Access Key (Password)</label>
                <button type="button" className="text-xs font-semibold text-primary hover:text-primary-fixed-dim transition-colors uppercase">Forgot Key?</button>
              </div>
              <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-outline w-5 h-5" />
                </div>
                <input 
                  className="input-textured w-full bg-transparent border-none pl-10 pr-12 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base" 
                  id="password" type="password" placeholder="••••••••" required defaultValue="password"
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors" type="button">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              className="mechanical-button w-full bg-primary text-on-primary py-4 rounded font-semibold text-base hover:bg-primary-fixed-dim active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group mt-8"
            >
              AUTHENTICATE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Or Continuity Through</span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            {/* Social Login */}
            <button 
              type="button"
              className="w-full bg-surface-container-high border border-outline-variant text-on-surface py-3 rounded text-xs font-semibold uppercase hover:bg-surface-variant transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            NEW CANDIDATE? 
            <button className="text-primary font-bold hover:underline ml-2 uppercase tracking-wide">Create Account</button>
          </p>
        </motion.div>

        {/* Footer Info */}
        <div className="mt-8 flex justify-between px-2 opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-semibold text-outline tracking-[0.1em] uppercase">v2.4.0 Engin-Build</p>
          <div className="flex gap-4">
            <button
              onClick={toggleTheme}
              className="text-[10px] font-semibold text-outline hover:text-on-surface transition-colors tracking-[0.1em] uppercase flex items-center gap-1"
            >
              {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="text-[10px] font-semibold text-outline hover:text-on-surface transition-colors tracking-[0.1em] uppercase">Security</button>
            <button className="text-[10px] font-semibold text-outline hover:text-on-surface transition-colors tracking-[0.1em] uppercase">Protocol</button>
          </div>
        </div>
      </main>
    </div>
  );
}
