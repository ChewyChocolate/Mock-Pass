import React, { useState, useEffect, useMemo } from 'react';
import { BaseScreenProps } from '../types';
import { Timer, History, Bell, LayoutDashboard, Bookmark, CheckCircle2, Lightbulb, ArrowLeft, Grid, ArrowRight, Lock } from 'lucide-react';

export default function ExamScreen({ onNavigate }: BaseScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>('B');
  const [timeLeft, setTimeLeft] = useState(9895); // 02:44:55

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300; // < 5 mins

  // Generate grid items
  const gridItems = useMemo(() => Array.from({ length: 65 }, (_, i) => {
    const num = i + 1;
    let status: 'unanswered' | 'answered' | 'flagged' = 'unanswered';
    if (num < 42) {
      status = Math.random() > 0.1 ? 'answered' : 'flagged';
    } else if (num === 42) {
      status = 'answered'; // Current
    } else if (num > 42 && num < 50) {
      status = Math.random() > 0.8 ? 'flagged' : 'unanswered';
    }
    
    // Explicitly forcing some flags as per image
    if ([4, 17, 24, 58, 63].includes(num)) status = 'flagged';

    return { num, status };
  }), []);

  return (
    <div className="bg-surface text-on-surface font-sans h-screen flex flex-col overflow-hidden relative">
      {/* Texture */}
      <div className="fixed inset-0 pointer-events-none grain-texture opacity-30 z-0"></div>

      {/* Top Header Fixed */}
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-4 md:px-8 py-4 z-50 shrink-0">
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight">Mock Pass</span>
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest hidden md:block">General Information & Constitutional Provisions</span>
        </div>
        
        <div className="flex-1 max-w-md mx-4 md:mx-12 hidden md:block">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Progress</span>
            <span className="text-[10px] font-semibold text-on-surface-variant">42 / 100 Completed</span>
          </div>
          <div className="h-1 w-full bg-surface-variant overflow-hidden rounded-full">
            <div className="h-full bg-primary" style={{ width: '42%' }}></div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 relative z-50">
          <div className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border rounded shadow-sm transition-colors duration-500 bg-surface-container ${isLowTime ? 'border-error text-error bg-error-container' : 'border-outline-variant text-primary bg-primary-container/20'}`}>
            <Timer className="w-4 h-4" />
            <span className="font-mono text-sm md:text-lg tracking-tight font-bold">{formatTime(timeLeft)}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button className="p-2 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded transition-all"><History className="w-5 h-5"/></button>
            <button className="p-2 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded transition-all"><Bell className="w-5 h-5"/></button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10 pb-[72px]">
        {/* Left Sidebar (Navigator) */}
        <aside className="w-80 bg-surface-container border-r border-outline-variant hidden md:flex flex-col shrink-0">
          <div className="p-6 border-b border-outline-variant">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-secondary-container flex items-center justify-center border border-outline-variant rounded-sm">
                <LayoutDashboard className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Reviewer</p>
                <p className="text-xl font-bold leading-none tracking-tight">Question Navigator</p>
              </div>
            </div>
          </div>
          
          {/* Custom Scrollbar applied here */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-surface-container-low/50">
            <div className="grid grid-cols-5 gap-2">
              {gridItems.map((item) => (
                <button 
                  key={item.num}
                  className={`aspect-square flex items-center justify-center text-xs font-mono font-bold border rounded-sm relative
                    ${item.num === 42 ? 'border-primary ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low bg-secondary-container text-on-surface' : 
                      item.status === 'answered' ? 'bg-secondary-container text-on-secondary-container border-transparent hover:border-primary/50 transition-all' :
                      item.status === 'flagged' ? 'bg-terracotta/10 text-terracotta border-terracotta/30' :
                      'bg-surface-container-highest text-on-surface-variant border-transparent hover:border-primary/30 transition-all'
                    }
                  `}
                >
                  {String(item.num).padStart(2, '0')}
                  {item.status === 'flagged' && (
                    <Bookmark className="absolute -top-1 -right-1 w-3 h-3 text-terracotta fill-terracotta" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Exam Workspace */}
        <main className="flex-1 overflow-y-auto bg-surface-dim p-4 md:p-10 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8 pb-10">
            
            {/* Question Card */}
            <div className="bg-surface border border-outline-variant p-6 md:p-12 relative rounded shadow-sm">
              <div className="absolute -top-3 left-8 px-4 bg-surface border border-outline-variant font-mono text-[10px] text-primary uppercase tracking-widest font-bold">
                Item No. 42 of 100
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold leading-snug mb-10 tracking-tight text-on-surface">
                Under the 1987 Philippine Constitution, which of the following is NOT a fundamental power of the State?
              </h2>
              
              <div className="space-y-4">
                {[
                  { id: 'A', text: 'Police Power' },
                  { id: 'B', text: 'Power of Judicial Review' },
                  { id: 'C', text: 'Power of Eminent Domain' },
                  { id: 'D', text: 'Power of Taxation' }
                ].map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full flex items-center text-left transition-all duration-200 relative overflow-hidden active:scale-[0.99] rounded-sm group
                      ${selectedOption === opt.id 
                        ? 'border-2 border-primary bg-secondary-container/80 shadow-[0_4px_20px_rgba(190,198,224,0.05)]' 
                        : 'border border-outline-variant hover:border-primary/60 hover:bg-surface-container-lowest'
                      }
                    `}
                  >
                    <div className={`w-12 h-14 md:w-16 md:h-16 flex items-center justify-center border-r shrink-0 font-mono font-bold text-lg md:text-xl transition-colors
                      ${selectedOption === opt.id ? 'border-primary bg-primary-container text-primary' : 'border-outline-variant text-on-surface-variant group-hover:text-primary'}
                    `}>
                      {opt.id}
                    </div>
                    <div className={`flex-1 px-4 md:px-6 py-4 text-base md:text-lg transition-colors ${selectedOption === opt.id ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
                      {opt.text}
                    </div>
                    {selectedOption === opt.id && (
                      <CheckCircle2 className="w-5 h-5 mx-4 md:mx-6 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-16 pt-8 border-t border-outline-variant/40 flex justify-between items-center opacity-40">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Verification: CSE-B-2024-X42</span>
                <div className="flex gap-2">
                  <div className="w-8 h-[1px] bg-outline"></div>
                  <div className="w-4 h-[1px] bg-outline"></div>
                </div>
              </div>
            </div>

            {/* Context/Notes Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <div className="p-6 border border-outline-variant rounded flex items-start gap-4 bg-surface-container-lowest/50">
                <Lightbulb className="w-6 h-6 text-tertiary shrink-0" />
                <div>
                  <h4 className="text-sm font-bold mb-1 uppercase tracking-widest text-on-surface">Technical Note</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Fundamental powers are inherent in the state and do not need constitutional grant, although the Constitution regulates their exercise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Sticky Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-highest/90 backdrop-blur-md border-t border-outline-variant flex justify-around items-center px-4 py-3 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center w-full max-w-7xl mx-auto justify-between">
          
          <div className="flex items-center gap-2 md:gap-8">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary transition-all group px-4 py-2 rounded border border-transparent hover:border-outline-variant/30"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Exit Exam</span>
            </button>
            <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all md:hidden mx-2">
              <Grid className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase mt-1">Grid</span>
            </button>
            <button className="flex flex-col md:flex-row items-center justify-center gap-2 text-on-surface-variant hover:text-terracotta group focus:text-terracotta pt-1 md:pt-0 mx-2">
              <Bookmark className="w-5 h-5" />
              <span className="text-[10px] md:text-xs md:font-bold uppercase tracking-widest mt-1 md:mt-0">Flag Item</span>
            </button>
            <button className="flex flex-col md:flex-row items-center justify-center gap-2 text-primary font-bold transition-all px-4 py-2 hover:bg-primary/10 rounded">
              <span className="text-[10px] md:text-xs uppercase tracking-widest mt-1 md:mt-0 md:order-1 order-2">Next Item</span>
              <ArrowRight className="w-5 h-5 md:order-2 order-1" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Time Remaining</span>
              <span className={`font-mono font-bold tracking-tight ${isLowTime ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <button 
              onClick={() => onNavigate('review')}
              className="px-6 md:px-8 py-3 md:py-3.5 bg-error/90 hover:bg-error text-on-error text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all border border-transparent active:scale-95 flex items-center gap-2 rounded-sm shadow-md"
            >
              <span className="hidden md:inline">Submit Exam</span>
              <span className="md:hidden">Submit</span>
              <Lock className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
