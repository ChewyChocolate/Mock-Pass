import React from 'react';
import { BaseScreenProps } from '../types';
import MainLayout from '../components/MainLayout';
import { TrendingUp, ClipboardCheck, Timer, Settings, FileEdit, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardScreen({ onNavigate }: BaseScreenProps) {
  return (
    <MainLayout onNavigate={onNavigate} currentScreen="dashboard">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 w-full">
        
        {/* Hero Banner */}
        <section className="relative bg-primary-container rounded-lg overflow-hidden mb-12 border border-outline-variant/30 flex flex-col justify-center min-h-[280px]">
          <div className="p-8 md:p-12 relative z-20 w-full">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-tight">Welcome back, Alex!</h2>
            <p className="text-lg text-on-primary-container max-w-lg mb-8 leading-relaxed">
              Your path to civil service excellence continues. You've completed 65% of this week's target curriculum.
            </p>
            <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Weekly Progress</span>
                <span className="text-xs font-bold text-primary">65%</span>
              </div>
              <div className="step-indicator rounded-sm"></div>
            </div>
          </div>
          {/* Decorative element resembling the compass image from specs */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent blur-2xl pointer-events-none"></div>
        </section>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stat Card 1 */}
          <motion.div whileHover={{ y: -4 }} className="bg-surface-container-high p-6 border border-outline-variant rounded flex flex-col justify-between group hover:border-primary transition-all duration-300 min-h-[160px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Average Score</span>
                <TrendingUp className="text-primary w-5 h-5" />
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2 tracking-tighter">84%</div>
            </div>
            {/* Minimalist Bar Chart representation */}
            <div className="h-10 flex items-end gap-1 opacity-80 mt-4">
              <div className="flex-1 bg-primary/20 h-4 group-hover:bg-primary/40 transition-colors"></div>
              <div className="flex-1 bg-primary/30 h-6 group-hover:bg-primary/50 transition-colors"></div>
              <div className="flex-1 bg-primary/40 h-8 group-hover:bg-primary/70 transition-colors"></div>
              <div className="flex-1 bg-primary h-10 shadow-[0_0_10px_rgba(190,198,224,0.3)]"></div>
              <div className="flex-1 bg-primary/60 h-7 group-hover:bg-primary/80 transition-colors"></div>
            </div>
          </motion.div>

          {/* Stat Card 2 */}
          <motion.div whileHover={{ y: -4 }} className="bg-surface-container-high p-6 border border-outline-variant rounded flex flex-col justify-between group hover:border-primary transition-all duration-300 min-h-[160px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Quizzes</span>
                <ClipboardCheck className="text-primary w-5 h-5" />
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2 tracking-tighter">124</div>
            </div>
            <div className="text-sm font-medium text-on-surface-variant mt-4">
              +12 from last week
            </div>
          </motion.div>

          {/* Stat Card 3 */}
          <motion.div whileHover={{ y: -4 }} className="bg-surface-container-high p-6 border border-outline-variant rounded flex flex-col justify-between group hover:border-primary transition-all duration-300 min-h-[160px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Hours</span>
                <Timer className="text-primary w-5 h-5" />
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2 tracking-tighter">42.5h</div>
            </div>
            <div className="text-sm font-medium text-on-surface-variant mt-4">
              Avg 6h/day study time
            </div>
          </motion.div>
        </div>

        {/* Action Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Mock Exam Card */}
          <div 
            onClick={() => onNavigate('exam')}
            className="bg-surface p-8 border border-outline-variant rounded relative overflow-hidden group hover:border-primary cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="absolute -right-8 -top-8 opacity-5 group-hover:rotate-45 transition-transform duration-700 pointer-events-none">
              <Settings className="w-48 h-48 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Full Mock Exam</h3>
            <p className="text-base text-on-surface-variant mb-8 max-w-sm">Simulated environment with timed mechanical constraints.</p>
            <div className="flex items-center gap-4 text-primary group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-xs uppercase font-bold tracking-widest">Start Simulation</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Practice Card */}
          <div className="bg-surface p-8 border border-outline-variant rounded relative overflow-hidden group hover:border-primary cursor-pointer transition-all active:scale-[0.98]">
            <div className="absolute -right-8 -top-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <FileEdit className="w-48 h-48 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Targeted Practice</h3>
            <p className="text-base text-on-surface-variant mb-8 max-w-sm">Focus on specific topics where your score is below 70%.</p>
            <div className="flex items-center gap-4 text-primary group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-xs uppercase font-bold tracking-widest">Review Topics</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Recent History Table */}
        <section className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container/30">
            <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
            <button onClick={() => onNavigate('review')} className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/20 border-b border-outline-variant/50">
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Topic</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                <tr className="hover:bg-surface-variant/30 transition-colors cursor-pointer" onClick={() => onNavigate('review')}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.5)]"></div>
                      <span className="text-sm font-medium">Numerical Reasoning</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">Practice Set</td>
                  <td className="px-6 py-5 text-sm font-bold text-tertiary">92%</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">Oct 24, 2023</td>
                </tr>
                <tr className="hover:bg-surface-variant/30 transition-colors cursor-pointer" onClick={() => onNavigate('review')}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(190,198,224,0.5)]"></div>
                      <span className="text-sm font-medium">Philippine Constitution</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">Mock Exam</td>
                  <td className="px-6 py-5 text-sm font-bold text-primary">78%</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">Oct 22, 2023</td>
                </tr>
                <tr className="hover:bg-surface-variant/30 transition-colors cursor-pointer" onClick={() => onNavigate('review')}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]"></div>
                      <span className="text-sm font-medium">Abstract Logic</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">Practice Set</td>
                  <td className="px-6 py-5 text-sm font-bold text-error">64%</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">Oct 21, 2023</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
