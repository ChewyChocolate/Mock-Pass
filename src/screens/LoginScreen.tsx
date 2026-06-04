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
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.248 1.248-3.216 2.592-7.84 2.592-7.144 0-12.824-5.792-12.824-12.936s5.68-12.936 12.824-12.936c3.856 0 6.712 1.528 8.84 3.544l2.304-2.304c-2.408-2.296-5.544-4.048-11.144-4.048-10.4 0-18.912 8.512-18.912 18.912s8.512 18.912 18.912 18.912c5.68 0 9.96-1.872 13.312-5.392 3.456-3.456 4.544-8.32 4.544-12.232 0-.784-.064-1.536-.184-2.248h-17.632z" fill="#EA4335" />
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
