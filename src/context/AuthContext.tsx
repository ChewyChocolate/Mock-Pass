import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  SupabaseConfigError,
} from '../lib/supabase';
import { setDevAuthUser } from '../utils/devAuth';
import type { UserProfile } from '../types';
import { normalizeProfile } from '../lib/profile';
import {
  buildHandleBaseFromEmail,
  validateHandle,
  withNumericSuffix,
} from '../lib/handle';

export type AuthStatus = 'unconfigured' | 'loading' | 'signed-out' | 'signed-in';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  recoveryMode: boolean;
  handle: string | null;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  isConfigured: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile?: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  setHandle: (newHandle: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  exitRecoveryMode: () => void;
  clearError: () => void;
}

export function deriveAuthStatus(
  configured: boolean,
  session: Session | null,
  loading: boolean,
): AuthStatus {
  if (!configured) return 'unconfigured';
  if (loading) return 'loading';
  return session ? 'signed-in' : 'signed-out';
}

export function buildInitialAuthState(
  configured: boolean,
  initialSession: Session | null,
): AuthState {
  if (!configured) {
    return {
      status: 'unconfigured',
      user: null,
      session: null,
      recoveryMode: false,
      handle: null,
      error: null,
    };
  }
  return {
    status: initialSession ? 'signed-in' : 'signed-out',
    user: initialSession?.user ?? null,
    session: initialSession,
    recoveryMode: false,
    handle: null,
    error: null,
  };
}

const initialUnconfigured: AuthState = {
  status: 'unconfigured',
  user: null,
  session: null,
  recoveryMode: false,
  handle: null,
  error: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface ProfileRow {
  handle: string | null;
}

async function fetchHandleForUser(
  client: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await client
    .from('profiles')
    .select('handle')
    .eq('user_id', userId)
    .maybeSingle<ProfileRow>();
  if (error) {
    console.warn('[mockpass] failed to fetch handle:', error.message);
    return null;
  }
  return data?.handle ?? null;
}

async function ensureProfileRow(
  client: SupabaseClient,
  userId: string,
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<string> {
  const base = buildHandleBaseFromEmail(email);
  for (let attempt = 0; attempt < 6; attempt++) {
    // crypto.getRandomValues gives unpredictable entropy that doesn't
    // collide for users signing up in the same millisecond (or for
    // repeat retries). Fall back to Math.random if the Web Crypto API
    // is unavailable (e.g. in a non-secure-context test environment).
    let rand: number;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      rand = buf[0]!;
    } else {
      rand = Math.floor(Math.random() * 0xffffffff);
    }
    const handle = withNumericSuffix(base, rand % 100000);
    const { error } = await client.from('profiles').insert({
      user_id: userId,
      handle,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
    });
    if (!error) return handle;
    if (error.code !== '23505') {
      throw new Error(error.message);
    }
  }
  throw new Error('Could not allocate a unique handle. Please try again.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [state, setState] = useState<AuthState>(() =>
    configured ? buildInitialAuthState(true, null) : initialUnconfigured,
  );

  const clientRef = useRef<ReturnType<typeof getSupabaseClient> | null>(null);
  const initTokenRef = useRef(0);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!configured) {
      setState(initialUnconfigured);
      return;
    }

    let client: ReturnType<typeof getSupabaseClient>;
    try {
      client = getSupabaseClient();
    } catch (err) {
      setState({
        ...initialUnconfigured,
        error: err instanceof Error ? err.message : 'Unknown Supabase error',
      });
      return;
    }
    clientRef.current = client;

    const myToken = ++initTokenRef.current;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    let active = true;

    const loadHandle = async (userId: string | null | undefined) => {
      if (!userId) {
        setState((prev) => ({ ...prev, handle: null }));
        return;
      }
      const handle = await fetchHandleForUser(client, userId);
      if (!active) return;
      setState((prev) => ({ ...prev, handle }));
    };

    const initialize = async () => {
      const { data, error } = await client.auth.getSession();
      if (!active || initTokenRef.current !== myToken) return;
      if (error) {
        setState({ ...initialUnconfigured, status: 'signed-out', error: error.message });
        return;
      }
      setState(buildInitialAuthState(true, data.session ?? null));
      setDevAuthUser(data.session?.user ?? null);
      userIdRef.current = data.session?.user?.id ?? null;
      void loadHandle(data.session?.user?.id);
    };

    initialize();

    const { data: sub } = client.auth.onAuthStateChange((event, newSession) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') {
        setState((prev) => ({
          ...prev,
          status: 'signed-in',
          user: newSession?.user ?? null,
          session: newSession,
          recoveryMode: true,
          error: null,
        }));
        setDevAuthUser(newSession?.user ?? null);
        userIdRef.current = newSession?.user?.id ?? null;
        void loadHandle(newSession?.user?.id);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setState((prev) => ({
          ...prev,
          status: 'signed-out',
          user: null,
          session: null,
          recoveryMode: false,
          handle: null,
          error: null,
        }));
        setDevAuthUser(null);
        userIdRef.current = null;
        return;
      }
      setState((prev) => ({
        ...prev,
        status: newSession ? 'signed-in' : 'signed-out',
        user: newSession?.user ?? null,
        session: newSession,
        recoveryMode: false,
        error: null,
      }));
      setDevAuthUser(newSession?.user ?? null);
      userIdRef.current = newSession?.user?.id ?? null;
      void loadHandle(newSession?.user?.id);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!clientRef.current) {
      const msg = 'Supabase is not configured.';
      setState((prev) => ({ ...prev, error: msg }));
      throw new SupabaseConfigError(msg);
    }
    const { error } = await clientRef.current.auth.signInWithPassword({ email, password });
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
      throw new Error(error.message);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, profile?: UserProfile) => {
    if (!clientRef.current) {
      const msg = 'Supabase is not configured.';
      setState((prev) => ({ ...prev, error: msg }));
      throw new SupabaseConfigError(msg);
    }
    const data = normalizeProfile(profile);
    const { data: signUpData, error } = await clientRef.current.auth.signUp({
      email,
      password,
      options: { data },
    });
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
      throw new Error(error.message);
    }
    const newUser = signUpData.user;
    if (newUser && signUpData.session) {
      try {
        await ensureProfileRow(
          clientRef.current,
          newUser.id,
          email,
          data.first_name,
          data.last_name,
        );
      } catch (profileErr) {
        console.warn('[mockpass] profile row creation failed:', profileErr);
      }
    }
  }, []);

  const updateProfile = useCallback(async (profile: UserProfile) => {
    if (!clientRef.current) {
      throw new SupabaseConfigError('Supabase is not configured.');
    }
    const data = normalizeProfile(profile);
    const { error } = await clientRef.current.auth.updateUser({ data });
    if (error) throw new Error(error.message);
    const currentUserId = userIdRef.current;
    if (currentUserId && (data.first_name !== undefined || data.last_name !== undefined)) {
      const { error: syncError } = await clientRef.current
        .from('profiles')
        .update({
          first_name: data.first_name ?? null,
          last_name: data.last_name ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', currentUserId);
      if (syncError) {
        console.warn('[mockpass] profile sync to public.profiles failed:', syncError.message);
      }
    }
  }, []);

  const setHandle = useCallback(async (newHandle: string) => {
    if (!clientRef.current) {
      throw new SupabaseConfigError('Supabase is not configured.');
    }
    const currentUserId = userIdRef.current;
    if (!currentUserId) {
      throw new Error('You must be signed in to change your handle.');
    }
    const validation = validateHandle(newHandle);
    if (!validation.ok) {
      throw new Error(validation.error ?? 'Invalid handle.');
    }
    const handle = newHandle.trim().toLowerCase();
    // Pass the current user_id so the RPC skips the caller's own row —
    // otherwise "change to my current handle" reports "taken" because the
    // row exists. Closes the TOCTOU window with the subsequent UPDATE.
    const { data: available, error: rpcError } = await clientRef.current.rpc(
      'is_handle_available',
      { handle, exclude_user_id: currentUserId },
    );
    if (rpcError) throw new Error(rpcError.message);
    if (!available) {
      throw new Error('That handle is already taken.');
    }
    const { error } = await clientRef.current
      .from('profiles')
      .update({ handle, updated_at: new Date().toISOString() })
      .eq('user_id', currentUserId);
    if (error) throw new Error(error.message);
    setState((prev) => ({ ...prev, handle }));
  }, []);

  const signOut = useCallback(async () => {
    if (!clientRef.current) return;
    const { error } = await clientRef.current.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    if (!clientRef.current) {
      const msg = 'Supabase is not configured.';
      setState((prev) => ({ ...prev, error: msg }));
      throw new SupabaseConfigError(msg);
    }
    const { error } = await clientRef.current.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
      throw new Error(error.message);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!clientRef.current) {
      const msg = 'Supabase is not configured.';
      setState((prev) => ({ ...prev, error: msg }));
      throw new SupabaseConfigError(msg);
    }
    const { error } = await clientRef.current.auth.updateUser({ password: newPassword });
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
      throw new Error(error.message);
    }
  }, []);

  const exitRecoveryMode = useCallback(() => {
    setState((prev) => ({ ...prev, recoveryMode: false }));
    if (typeof window !== 'undefined' && window.location.hash) {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', pathname + search);
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isConfigured: configured,
      isLoading: state.status === 'loading',
      isSignedIn: state.status === 'signed-in',
      signIn,
      signUp,
      signOut,
      updateProfile,
      setHandle,
      resetPasswordForEmail,
      updatePassword,
      exitRecoveryMode,
      clearError,
    }),
    [
      state,
      configured,
      signIn,
      signUp,
      signOut,
      updateProfile,
      setHandle,
      resetPasswordForEmail,
      updatePassword,
      exitRecoveryMode,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
