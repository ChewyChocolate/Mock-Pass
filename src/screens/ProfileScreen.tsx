import { useState, type FormEvent } from 'react';
import { BaseScreenProps } from '../types';
import { User, Mail, Save, Lock, Check, ArrowRight } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { SectionCard } from '../components/SectionCard';
import { SectionHeader } from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { deriveDisplayName } from '../lib/profile';

export default function ProfileScreen({ onNavigate }: BaseScreenProps) {
  const { user, updateProfile, resetPasswordForEmail, error, clearError } = useAuth();

  const initialFirst = (user?.user_metadata as { first_name?: string } | undefined)?.first_name ?? '';
  const initialLast = (user?.user_metadata as { last_name?: string } | undefined)?.last_name ?? '';
  const email = user?.email ?? '';

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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
