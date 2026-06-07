import { useState, type FormEvent } from 'react';
import { BaseScreenProps } from '../types';
import { Lock, Eye, EyeOff, ArrowRight, PenTool, KeyRound, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { validateNewPassword } from '../utils/passwordValidation';

export default function ResetPasswordScreen({ onNavigate }: BaseScreenProps) {
  const { updatePassword, exitRecoveryMode, error, clearError } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationField, setValidationField] = useState<'password' | 'confirm' | null>(null);

  const handleCancel = () => {
    exitRecoveryMode();
    onNavigate('login');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const validationError = validateNewPassword(newPassword, confirmPassword);
    if (validationError) {
      setValidationField(validationError.field);
      setValidationMessage(validationError.message);
      return;
    }
    setValidationField(null);
    setValidationMessage(null);
    setSubmitting(true);
    clearError();
    try {
      await updatePassword(newPassword);
      exitRecoveryMode();
      onNavigate('dashboard');
    } catch (err) {
      void err;
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting;

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen flex items-center justify-center p-4 md:p-16 cse-pattern overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-[440px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-surface-container border border-outline-variant rounded-xl p-8 md:p-10 shadow-2xl backdrop-blur-sm"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-tertiary-container border border-outline-variant flex items-center justify-center mb-6 relative">
              <KeyRound className="text-tertiary w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary"></div>
            </div>
            <h1 className="text-3xl font-semibold text-on-surface tracking-tight mb-2 text-center">
              Set New Password
            </h1>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest text-center">
              Recovery In Progress
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <p className="text-sm text-on-surface-variant text-center">
              Choose a new access key to finish resetting your account.
            </p>

            <div className="space-y-2 group">
              <label
                className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                htmlFor="newPassword"
              >
                New Access Key
              </label>
              <div
                className={`relative custom-focus transition-all duration-300 border rounded bg-surface-container-low overflow-hidden ${
                  validationField === 'password' ? 'border-error' : 'border-outline-variant'
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-outline w-5 h-5" />
                </div>
                <input
                  className="input-textured w-full bg-transparent border-none pl-10 pr-12 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (validationField === 'password') {
                      setValidationField(null);
                      setValidationMessage(null);
                    }
                  }}
                  autoComplete="new-password"
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

            <div className="space-y-2 group">
              <label
                className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                htmlFor="confirmPassword"
              >
                Confirm New Access Key
              </label>
              <div
                className={`relative custom-focus transition-all duration-300 border rounded bg-surface-container-low overflow-hidden ${
                  validationField === 'confirm' ? 'border-error' : 'border-outline-variant'
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Check className="text-outline w-5 h-5" />
                </div>
                <input
                  className="input-textured w-full bg-transparent border-none pl-10 pr-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationField === 'confirm') {
                      setValidationField(null);
                      setValidationMessage(null);
                    }
                  }}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {validationMessage && (
              <p role="alert" className="text-xs text-error bg-error-container/40 border border-error/30 rounded px-3 py-2">
                {validationMessage}
              </p>
            )}

            {error && (
              <p role="alert" className="text-xs text-error bg-error-container/40 border border-error/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className="mechanical-button w-full bg-primary text-on-primary py-4 rounded font-semibold text-base hover:bg-primary-fixed-dim active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'UPDATING…' : 'Update Access Key'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="w-full text-xs font-semibold text-on-surface-variant hover:text-on-surface uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        </motion.div>

        <div className="mt-8 flex justify-center px-2 opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-semibold text-outline tracking-[0.1em] uppercase">
            v2.5.0 Sync-Build
          </p>
        </div>
      </main>
    </div>
  );
}
