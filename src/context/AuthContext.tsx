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
import type { Session, User } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  SupabaseConfigError,
} from '../lib/supabase';
import { setDevAuthUser } from '../utils/devAuth';
import type { UserProfile } from '../types';

export type AuthStatus = 'unconfigured' | 'loading' | 'signed-out' | 'signed-in';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  isConfigured: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile?: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
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
    return { status: 'unconfigured', user: null, session: null, error: null };
  }
  return {
    status: initialSession ? 'signed-in' : 'signed-out',
    user: initialSession?.user ?? null,
    session: initialSession,
    error: null,
  };
}

const initialUnconfigured: AuthState = {
  status: 'unconfigured',
  user: null,
  session: null,
  error: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [state, setState] = useState<AuthState>(() =>
    configured ? buildInitialAuthState(true, null) : initialUnconfigured,
  );

  const clientRef = useRef<ReturnType<typeof getSupabaseClient> | null>(null);
  const initTokenRef = useRef(0);

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

    const initialize = async () => {
      const { data, error } = await client.auth.getSession();
      if (!active || initTokenRef.current !== myToken) return;
      if (error) {
        setState({ ...initialUnconfigured, status: 'signed-out', error: error.message });
        return;
      }
      setState(buildInitialAuthState(true, data.session ?? null));
      setDevAuthUser(data.session?.user ?? null);
    };

    initialize();

    const { data: sub } = client.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setState((prev) => ({
        ...prev,
        status: newSession ? 'signed-in' : 'signed-out',
        user: newSession?.user ?? null,
        session: newSession,
        error: null,
      }));
      setDevAuthUser(newSession?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!clientRef.current) {
      throw new SupabaseConfigError('Supabase is not configured.');
    }
    const { error } = await clientRef.current.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(async (email: string, password: string, profile?: UserProfile) => {
    if (!clientRef.current) {
      throw new SupabaseConfigError('Supabase is not configured.');
    }
    const data: Record<string, string> = {};
    const first = profile?.first_name?.trim();
    const last = profile?.last_name?.trim();
    if (first) data.first_name = first;
    if (last) data.last_name = last;
    const { error } = await clientRef.current.auth.signUp({
      email,
      password,
      options: { data },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    if (!clientRef.current) return;
    const { error } = await clientRef.current.auth.signOut();
    if (error) throw new Error(error.message);
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
      clearError,
    }),
    [state, configured, signIn, signUp, signOut, clearError],
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
