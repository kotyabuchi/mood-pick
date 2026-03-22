'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createClient } from '@/lib/supabase/client';

import type { AuthError, Session, User } from '@supabase/supabase-js';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null; needsEmailVerification: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  resendVerificationEmail: (
    email: string,
  ) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUser(supabaseUser: User): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    emailVerified: !!supabaseUser.email_confirmed_at,
    createdAt: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const updateStateFromSession = useCallback((session: Session | null) => {
    if (session?.user) {
      setState({
        user: mapSupabaseUser(session.user),
        session,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Failed to get session:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }
      updateStateFromSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateStateFromSession(session);
    });

    // Web: visibilitychange で autoRefresh を管理
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [supabase, updateStateFromSession]);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ error: AuthError | null }> => {
      if (!supabase) return { error: null };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    },
    [supabase],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{
      error: AuthError | null;
      needsEmailVerification: boolean;
    }> => {
      if (!supabase) return { error: null, needsEmailVerification: false };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error, needsEmailVerification: false };
      }

      const needsEmailVerification = !data.session;
      return { error: null, needsEmailVerification };
    },
    [supabase],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await supabase?.auth.signOut();
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: AuthError | null }> => {
      if (!supabase) return { error: null };
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    },
    [supabase],
  );

  const resendVerificationEmail = useCallback(
    async (email: string): Promise<{ error: AuthError | null }> => {
      if (!supabase) return { error: null };
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      return { error };
    },
    [supabase],
  );

  const value: AuthContextType = useMemo(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      resetPassword,
      resendVerificationEmail,
    }),
    [state, signIn, signUp, signOut, resetPassword, resendVerificationEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
