import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BaseScreenProps } from '../types';
import { User, Mail, Save, Lock, Check, ArrowRight, AtSign, Loader2, X } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { SectionCard } from '../components/SectionCard';
import { SectionHeader } from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { deriveDisplayName } from '../lib/profile';
import { validateHandle } from '../lib/handle';
import { getSupabaseClient } from '../lib/supabase';

type HandleStatus =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available' }
  | { kind: 'taken' }
  | { kind: 'invalid'; error: string };

export default function ProfileScreen({ onNavigate }: BaseScreenProps) {
  const {
    user,
    updateProfile,
    resetPasswordForEmail,
    setHandle: setAuthHandle,
    handle: currentHandle,
    error,
    clearError,
  } = useAuth();

  const initialFirst = (user?.user_metadata as { first_name?: string } | undefined)?.first_name ?? '';
  const initialLast = (user?.user_metadata as { last_name?: string } | undefined)?.last_name ?? '';
  const email = user?.email ?? '';

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [handleInput, setHandleInput] = useState(currentHandle ?? '');
  const [handleStatus, setHandleStatus] = useState<HandleStatus>({ kind: 'idle' });
  const [savingHandle, setSavingHandle] = useState(false);
  const [handleSuccess, setHandleSuccess] = useState(false);
  const handleCheckSeq = useRef(0);

  useEffect(() => {
    setHandleInput(currentHandle ?? '');
  }, [currentHandle]);

  useEffect(() => {
    const trimmed = handleInput.trim().toLowerCase();
    if (trimmed === '' && !currentHandle) {
      setHandleStatus({ kind: 'idle' });
      return;
    }
    if (trimmed === (currentHandle ?? '').toLowerCase()) {
      setHandleStatus({ kind: 'idle' });
      return;
    }
    const validation = validateHandle(handleInput);
    if (!validation.ok) {
      setHandleStatus({ kind: 'invalid', error: validation.error ?? 'Invalid handle.' });
      return;
    }
    const seq = ++handleCheckSeq.current;
    setHandleStatus({ kind: 'checking' });
    const timer = window.setTimeout(async () => {
      try {
        const client = getSupabaseClient();
        const { data, error: rpcError } = await client.rpc('is_handle_available', {
          handle: trimmed,
        });
        if (handleCheckSeq.current !== seq) return;
        if (rpcError) {
          setHandleStatus({ kind: 'invalid', error: rpcError.message });
          return;
        }
        setHandleStatus(data ? { kind: 'available' } : { kind: 'taken' });
      } catch (err) {
        if (handleCheckSeq.current !== seq) return;
        setHandleStatus({
          kind: 'invalid',
          error: err instanceof Error ? err.message : 'Could not check availability.',
        });
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [handleInput, currentHandle]);

  const hasNameChanges =
    firstName.trim() !== initialFirst.trim() || lastName.trim() !== initialLast.trim();

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    setProfileSuccess(false);
    clearError();
    try {
      await updateProfile({ first_name: firstName, last_name: lastName });
      setProfileSuccess(true);
    } catch (err) {
      void err;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleHandleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (savingHandle) return;
    if (handleStatus.kind !== 'available' && handleStatus.kind !== 'idle') return;
    if (handleInput.trim().toLowerCase() === (currentHandle ?? '').toLowerCase()) return;
    setSavingHandle(true);
    setHandleSuccess(false);
    clearError();
    try {
      await setAuthHandle(handleInput);
      setHandleSuccess(true);
    } catch (err) {
      void err;
    } finally {
      setSavingHandle(false);
    }
  };

  const handleSendReset = async () => {
    if (sendingReset || !email) return;
    setSendingReset(true);
    setResetSent(false);
    clearError();
    try {
      await resetPasswordForEmail(email);
      setResetSent(true);
    } catch (err) {
      void err;
    } finally {
      setSendingReset(false);
    }
  };

  const displayName = deriveDisplayName(user);
  const handleDirty =
    handleInput.trim().toLowerCase() !== (currentHandle ?? '').toLowerCase();
  const handleCanSave = handleDirty && (handleStatus.kind === 'available' || handleStatus.kind === 'idle');

  return (
    <MainLayout onNavigate={onNavigate} currentScreen="profile">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 w-full">
        <SectionHeader
          icon={<User className="w-5 h-5 text-primary" />}
          title="Profile"
          subtitle={
            displayName
              ? `Signed in as ${displayName}.`
              : 'Manage your account details.'
          }
        />

        <div className="space-y-6 mt-6">
          <SectionCard>
            <SectionHeader
              icon={<Mail className="w-5 h-5 text-primary" />}
              title="Account"
              subtitle="Email is fixed and cannot be changed."
            />
            <div className="space-y-2 group">
              <label
                className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase flex items-center gap-1"
                htmlFor="profileEmail"
              >
                <Mail className="w-3 h-3" />
                Email
              </label>
              <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                <input
                  className="input-textured w-full bg-transparent border-none px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                  id="profileEmail"
                  type="email"
                  value={email}
                  disabled
                  readOnly
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<User className="w-5 h-5 text-primary" />}
              title="Display Name"
              subtitle="Used to personalize the dashboard greeting."
            />
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                    htmlFor="profileFirstName"
                  >
                    First Name
                  </label>
                  <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                    <input
                      className="input-textured w-full bg-transparent border-none px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                      id="profileFirstName"
                      type="text"
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setProfileSuccess(false);
                      }}
                      autoComplete="given-name"
                      maxLength={50}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                    htmlFor="profileLastName"
                  >
                    Last Name
                  </label>
                  <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                    <input
                      className="input-textured w-full bg-transparent border-none px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
                      id="profileLastName"
                      type="text"
                      placeholder="Dela Cruz"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setProfileSuccess(false);
                      }}
                      autoComplete="family-name"
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs text-error bg-error-container/40 border border-error/30 rounded px-3 py-2">
                  {error}
                </p>
              )}

              {profileSuccess && (
                <p
                  role="status"
                  className="text-xs text-tertiary bg-tertiary-container/40 border border-tertiary/30 rounded px-3 py-2 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Name updated.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="submit"
                  disabled={savingProfile || !hasNameChanges}
                  className="bg-primary text-on-primary px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<AtSign className="w-5 h-5 text-primary" />}
              title="Public Handle"
              subtitle="How you appear on the leaderboard. 3-20 chars, lowercase letters, numbers, underscores."
            />
            <form onSubmit={handleHandleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                  htmlFor="profileHandle"
                >
                  Handle
                </label>
                <div className="relative custom-focus transition-all duration-300 border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                  <input
                    className="input-textured w-full bg-transparent border-none pl-10 pr-12 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base font-mono"
                    id="profileHandle"
                    type="text"
                    placeholder="chewy_choc"
                    value={handleInput}
                    onChange={(e) => {
                      setHandleInput(e.target.value);
                      setHandleSuccess(false);
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={20}
                  />
                  <AtSign className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {handleStatus.kind === 'checking' && (
                      <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />
                    )}
                    {handleStatus.kind === 'available' && (
                      <Check className="w-4 h-4 text-tertiary" />
                    )}
                    {(handleStatus.kind === 'taken' || handleStatus.kind === 'invalid') && (
                      <X className="w-4 h-4 text-error" />
                    )}
                  </span>
                </div>
                <div className="min-h-[20px] text-xs">
                  {handleStatus.kind === 'available' && (
                    <p className="text-tertiary">Available</p>
                  )}
                  {handleStatus.kind === 'taken' && (
                    <p className="text-error">That handle is already taken.</p>
                  )}
                  {handleStatus.kind === 'invalid' && (
                    <p className="text-error">{handleStatus.error}</p>
                  )}
                  {handleStatus.kind === 'idle' && currentHandle && (
                    <p className="text-on-surface-variant">This is your current handle.</p>
                  )}
                </div>
              </div>

              {handleSuccess && (
                <p
                  role="status"
                  className="text-xs text-tertiary bg-tertiary-container/40 border border-tertiary/30 rounded px-3 py-2 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Handle updated.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="submit"
                  disabled={savingHandle || !handleCanSave}
                  className="bg-primary text-on-primary px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
                >
                  <Save className="w-4 h-4" />
                  {savingHandle ? 'Saving…' : 'Save Handle'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<Lock className="w-5 h-5 text-primary" />}
              title="Password"
              subtitle="We&apos;ll email a secure link to choose a new password."
            />
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleSendReset}
                disabled={sendingReset || !email}
                className="bg-surface-container-high border border-outline-variant text-on-surface px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                {sendingReset ? 'Sending…' : 'Send Reset Link'}
                {!sendingReset && <ArrowRight className="w-4 h-4" />}
              </button>

              {resetSent && (
                <div className="border border-tertiary/30 bg-tertiary-container/30 rounded p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-tertiary-container border border-tertiary flex items-center justify-center shrink-0">
                    <Check className="text-tertiary w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-on-surface">Check your inbox</p>
                    <p className="text-xs text-on-surface-variant">
                      If <span className="font-semibold text-on-surface">{email}</span> matches an
                      account, a reset link is on its way. The link lands you on the Set New
                      Password screen.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </MainLayout>
  );
}
