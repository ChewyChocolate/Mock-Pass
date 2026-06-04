import React, { useState } from 'react';
import { BaseScreenProps } from '../types';
import MainLayout from '../components/MainLayout';
import { CheckCircle2, XCircle, BrainCircuit, ChevronDown } from 'lucide-react';

export default function ReviewScreen({ onNavigate }: BaseScreenProps) {
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({ 1: true });

  const toggleAccordion = (id: number) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <MainLayout onNavigate={onNavigate} currentScreen="review">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left: Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-surface-container-low border border-outline-variant p-8 rounded relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant opacity-50">Report #2024-882</span>
            </div>
            
            <h2 className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-10">Performance Summary</h2>
            
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                {/* Simulated SVG progress circle since conic-gradient is tricky with Tailwind arbitrary variants sometimes */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-outline-variant)" strokeWidth="10" className="opacity-30" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-tertiary)" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.82)} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-on-surface tracking-tighter">82<span className="text-2xl text-on-surface-variant">%</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mt-1">Final Score</span>
                </div>
              </div>
              
              {/* PASSED Banner */}
              <div className="w-full bg-tertiary-container/40 border border-tertiary/30 py-3 px-6 flex items-center justify-center gap-3 rounded-sm">
                <CheckCircle2 className="text-tertiary w-5 h-5" />
                <span className="text-sm font-bold text-tertiary uppercase tracking-[0.2em]">PASSED (82%)</span>
              </div>
            </div>
            
            <div className="mt-10 space-y-4">
              <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant/30 pb-3">
                <span className="text-xs font-semibold tracking-wide">Time Spent</span>
                <span className="text-sm font-mono text-on-surface">01:42:15</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant/30 pb-3">
                <span className="text-xs font-semibold tracking-wide">Correct Answers</span>
                <span className="text-sm font-mono text-on-surface">123/150</span>
              </div>
            </div>
          </section>

          {/* Domain Breakdown */}
          <section className="bg-surface-container-low border border-outline-variant p-8 rounded">
            <h3 className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-8">Domain Proficiency</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Verbal Ability</span>
                  <span className="text-xs font-bold text-primary">94%</span>
                </div>
                <div className="h-1 bg-outline-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Analytical Reasoning</span>
                  <span className="text-xs font-bold text-primary">78%</span>
                </div>
                <div className="h-1 bg-outline-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Numerical Ability</span>
                  <span className="text-xs font-bold text-error">65%</span>
                </div>
                <div className="h-1 bg-outline-variant rounded-full overflow-hidden">
                  <div className="h-full bg-error" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Question Review Workspace */}
        <div className="lg:col-span-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Review Workspace</h1>
              <p className="text-base text-on-surface-variant">Review your mistakes and detailed solutions below.</p>
            </div>
            <button className="bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded whitespace-nowrap">
              Download Report
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Question 1: Correct */}
            <div className="bg-surface-container-low border border-outline-variant rounded overflow-hidden">
              <div className="p-6 md:p-8 border-l-4 border-tertiary">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Question 001 — Verbal</span>
                  <div className="flex items-center gap-2 text-tertiary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Correct</span>
                  </div>
                </div>
                <p className="text-lg font-medium leading-relaxed mb-8 text-on-surface">
                  Identify the grammatical error in the following sentence: "The group of researchers are exploring the uncharted territories of the archipelago."
                </p>
                
                <div className="grid gap-3 mb-8">
                  <div className="p-4 border border-outline-variant/50 rounded flex justify-between items-center opacity-70">
                    <span className="text-base">A) The group of</span>
                    <div className="w-5 h-5 rounded-full border border-outline-variant"></div>
                  </div>
                  <div className="p-4 bg-tertiary-container/30 border-2 border-tertiary rounded flex justify-between items-center shadow-[0_0_15px_rgba(78,222,163,0.1)]">
                    <span className="text-base font-medium text-on-surface">B) researchers are</span>
                    <CheckCircle2 className="w-5 h-5 text-tertiary" />
                  </div>
                  <div className="p-4 border border-outline-variant/50 rounded flex justify-between items-center opacity-70">
                    <span className="text-base">C) exploring the</span>
                    <div className="w-5 h-5 rounded-full border border-outline-variant"></div>
                  </div>
                </div>

                {/* Accordion */}
                <div className="border-t border-outline-variant/40 pt-4">
                  <button 
                    onClick={() => toggleAccordion(1)}
                    className="w-full flex items-center justify-between py-2 group focus:outline-none"
                  >
                    <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" />
                      Solution Breakdown
                    </span>
                    <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 ${openAccordions[1] ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordions[1] ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 bg-surface-variant/30 rounded text-sm text-on-surface-variant leading-relaxed border border-outline-variant/30">
                      The collective noun "group" is singular and requires the singular verb "is" instead of "are." This is a common subject-verb agreement error tested in the Civil Service Examination.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question 2: Incorrect */}
            <div className="bg-surface-container-low border border-outline-variant rounded overflow-hidden">
              <div className="p-6 md:p-8 border-l-4 border-error">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Question 002 — Numerical</span>
                  <div className="flex items-center gap-2 text-error">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Incorrect</span>
                  </div>
                </div>
                <p className="text-lg font-medium leading-relaxed mb-8 text-on-surface">
                  If a person can complete a task in 8 hours, how long will it take for three people working at the same rate to finish the task?
                </p>
                
                <div className="grid gap-3 mb-8">
                  {/* Selected but wrong */}
                  <div className="p-4 bg-error-container/20 border-2 border-error rounded flex justify-between items-center shadow-[0_0_15px_rgba(255,180,171,0.1)]">
                    <span className="text-base font-medium text-error flex items-center gap-2">
                      <XCircle className="w-4 h-4 opacity-50" />
                      A) 24 hours
                    </span>
                    <XCircle className="w-5 h-5 text-error" />
                  </div>
                  {/* Correct choice missed */}
                  <div className="p-4 bg-tertiary-container/20 border border-tertiary rounded flex justify-between items-center">
                    <span className="text-base text-tertiary">B) 2 hours and 40 minutes</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-widest">
                      Correct Choice
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-4 border border-outline-variant/50 rounded flex justify-between items-center opacity-70">
                    <span className="text-base">C) 4 hours</span>
                    <div className="w-5 h-5 rounded-full border border-outline-variant"></div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/40 pt-4">
                  <button 
                    onClick={() => toggleAccordion(2)}
                    className="w-full flex items-center justify-between py-2 group focus:outline-none"
                  >
                    <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" />
                      Solution Breakdown
                    </span>
                    <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 ${openAccordions[2] ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordions[2] ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 bg-surface-variant/30 rounded text-sm text-on-surface-variant leading-relaxed border border-outline-variant/30">
                      This is an inverse variation problem. More workers means less time.<br/>
                      Calculation: 8 hours / 3 workers = 2.66 hours.<br/>
                      0.66 hours * 60 minutes = 40 minutes.<br/>
                      Result: 2 hours and 40 minutes.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
