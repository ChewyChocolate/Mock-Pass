import { useState, type FormEvent } from 'react';
import { BaseScreenProps } from '../types';
import { Mail, Lock, Eye, EyeOff, ArrowRight, PenTool, Sun, Moon, User, Send, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';

type Mode = 'sign-in' | 'sign-up' | 'forgot';
type ForgotState = 'idle' | 'sent';

export default function LoginScreen({ onNavigate }: BaseScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const { signIn, signUp, resetPasswordForEmail, isConfigured, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mode, setMode] = useState<Mode>('sign-in');
  const [forgotState, setForgotState] = useState<ForgotState>('idle');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    clearError();
    try {
      if (mode === 'sign-in') {
        await signIn(email, password);
      } else if (mode === 'sign-up') {
        await signUp(email, password, { first_name: firstName, last_name: lastName });
      } else {
        await resetPasswordForEmail(email);
        setForgotState('sent');
        return;
      }
      onNavigate('dashboard');
    } catch (err) {
      // AuthContext's `error` state already holds the message.
      void err;
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    clearError();
    setFirstName('');
    setLastName('');
    setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'));
  };

  const goToForgot = () => {
    clearError();
    setPassword('');
    setForgotState('idle');
    setMode('forgot');
  };

  const backToSignIn = () => {
    clearError();
    setForgotState('idle');
    setMode('sign-in');
  };

  const isDisabled = submitting || isLoading || (mode !== 'forgot' && !isConfigured);
  const submitLabel =
    mode === 'sign-in' ? 'AUTHENTICATE' : mode === 'sign-up' ? 'CREATE ACCOUNT' : 'SEND RESET LINK';

  const resendReset = () => {
    clearError();
    setSubmitting(true);
    resetPasswordForEmail(email)
      .catch((err) => void err)
      .finally(() => setSubmitting(false));
  };

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

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Name Fields (sign-up only) */}
            {mode === 'sign-up' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase flex items-center gap-1"
                    htmlFor="firstName"
                  >
                    <User className="w-3 h-3" />
                    First Name <span className="opacity-50 normal-case font-normal">· optional</span>
                  </label>
                  <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                    <input
                      className="input-textured w-full bg-transparent border-none px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                      id="firstName" type="text" placeholder="Juan"
                      value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name" maxLength={50}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                    htmlFor="lastName"
                  >
                    Last Name <span className="opacity-50 normal-case font-normal">· optional</span>
                  </label>
                  <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                    <input
                      className="input-textured w-full bg-transparent border-none px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                      id="lastName" type="text" placeholder="Dela Cruz"
                      value={lastName} onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name" maxLength={50}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-2 group">
              <label className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase" htmlFor="email">Identification (Email)</label>
              <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-outline w-5 h-5" />
                </div>
                <input
                  className="input-textured w-full bg-transparent border-none pl-10 pr-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                  id="email" type="email" placeholder="aspirant@gov.ph" required
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field (sign-in / sign-up only) */}
            {mode !== 'forgot' && (
              <div className="space-y-2 group">
                <div className="flex justify-between items-end ml-1">
                  <label className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase" htmlFor="password">Access Key (Password)</label>
                  {mode === 'sign-in' && (
                    <button type="button" onClick={goToForgot} className="text-xs font-semibold text-primary hover:text-primary-fixed-dim transition-colors uppercase">Forgot Key?</button>
                  )}
                </div>
                <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-outline w-5 h-5" />
                  </div>
                  <input
                    className="input-textured w-full bg-transparent border-none pl-10 pr-12 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                    id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" required minLength={6}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot-mode hint */}
            {mode === 'forgot' && (
              <p className="text-xs text-on-surface-variant text-center">
                Enter the email tied to your account. We&apos;ll send a secure link to choose a new access key.
              </p>
            )}

            {/* Error message */}
            {error && (
              <p role="alert" className="text-xs text-error bg-error-container/40 border border-error/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            {!isConfigured && mode !== 'forgot' && (
              <p className="text-xs text-on-surface-variant bg-surface-variant/60 border border-outline-variant rounded px-3 py-2">
                Backend is not configured. Set <code>VITE_SUPABASE_URL</code> and{' '}
                <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to enable sign-in.
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isDisabled}
              className="mechanical-button w-full bg-primary text-on-primary py-4 rounded font-semibold text-base hover:bg-primary-fixed-dim active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && mode === 'forgot' ? (
                <>
                  <Send className="w-5 h-5" />
                  SENDING…
                </>
              ) : submitting ? (
                'PLEASE WAIT…'
              ) : (
                <>
                  {submitLabel}
                  {mode === 'forgot' ? (
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </>
              )}
            </button>

            {/* Divider + Social Login (sign-in / sign-up only) */}
            {mode !== 'forgot' && (
              <>
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-outline-variant"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Or Continuity Through</span>
                  <div className="flex-grow border-t border-outline-variant"></div>
                </div>

                <button
                  type="button"
                  disabled
                  aria-label="Continue with Google (coming soon)"
                  className="w-full bg-surface-container-high border border-outline-variant text-on-surface py-3 rounded text-xs font-semibold uppercase hover:bg-surface-variant transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}
          </form>

          {forgotState === 'sent' ? (
            <div className="mt-8 space-y-4">
              <div className="flex flex-col items-center text-center space-y-3 py-4 border border-tertiary/30 bg-tertiary-container/30 rounded">
                <div className="w-12 h-12 bg-tertiary-container border border-tertiary flex items-center justify-center">
                  <Check className="text-tertiary w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-on-surface">Check your inbox</p>
                <p className="text-xs text-on-surface-variant px-4">
                  If <span className="font-semibold text-on-surface">{email}</span> matches an account, a reset link is on its way.
                </p>
                <button
                  type="button"
                  onClick={resendReset}
                  disabled={submitting}
                  className="text-xs font-semibold text-primary hover:text-primary-fixed-dim uppercase tracking-wide disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Resend link'}
                </button>
              </div>
              <p className="text-center text-sm text-on-surface-variant">
                <button
                  type="button"
                  onClick={backToSignIn}
                  className="text-primary font-bold hover:underline uppercase tracking-wide"
                >
                  Back to Sign In
                </button>
              </p>
            </div>
          ) : mode === 'forgot' ? (
            <p className="mt-8 text-center text-sm text-on-surface-variant">
              REMEMBER IT?
              <button
                type="button"
                onClick={backToSignIn}
                className="text-primary font-bold hover:underline ml-2 uppercase tracking-wide"
              >
                Back to Sign In
              </button>
            </p>
          ) : (
            <p className="mt-8 text-center text-sm text-on-surface-variant">
              {mode === 'sign-in' ? 'NEW CANDIDATE?' : 'ALREADY HAVE AN ACCOUNT?'}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary font-bold hover:underline ml-2 uppercase tracking-wide"
              >
                {mode === 'sign-in' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          )}
        </motion.div>

        {/* Footer Info */}
        <div className="mt-8 flex justify-between px-2 opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-semibold text-outline tracking-[0.1em] uppercase">v2.5.0 Sync-Build</p>
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
