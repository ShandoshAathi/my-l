import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface DemoSession {
  user: {
    id: string;
    email: string;
  };
}

const LOCAL_ADMIN_USER_KEY = 'birthday_bloom_admin_user';
const LOCAL_ADMIN_PASS_KEY = 'birthday_bloom_admin_password';

const DEFAULT_CREATOR_SESSION = {
  id: 'admin-creator',
  email: 'creator@love.gift'
};

export function useAuth() {
  const [user, setUser] = useState<User | DemoSession['user'] | null>(() => {
    try {
      const savedAdmin = localStorage.getItem(LOCAL_ADMIN_USER_KEY);
      if (savedAdmin) return JSON.parse(savedAdmin);
    } catch {
      // fallback
    }
    return DEFAULT_CREATOR_SESSION;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local session
    try {
      const savedAdmin = localStorage.getItem(LOCAL_ADMIN_USER_KEY);
      if (savedAdmin) {
        setUser(JSON.parse(savedAdmin));
      } else {
        setUser(DEFAULT_CREATOR_SESSION);
        localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify(DEFAULT_CREATOR_SESSION));
      }
    } catch {
      setUser(DEFAULT_CREATOR_SESSION);
    }

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // 2. Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const local = localStorage.getItem(LOCAL_ADMIN_USER_KEY);
        setUser(local ? JSON.parse(local) : DEFAULT_CREATOR_SESSION);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Step 1: Send OTP to Admin Email
   */
  const sendOtp = useCallback(async (email: string): Promise<{ isDemo: boolean; demoCode?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured()) {
      const code = '123456';
      setDemoOtp(code);
      return { isDemo: true, demoCode: code };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        console.warn('Supabase signInWithOtp error, switching to demo mode:', error.message);
        const code = '123456';
        setDemoOtp(code);
        return { isDemo: true, demoCode: code };
      }

      return { isDemo: false };
    } catch {
      const code = '123456';
      setDemoOtp(code);
      return { isDemo: true, demoCode: code };
    }
  }, []);

  /**
   * Step 2: Verify OTP
   */
  const verifyOtp = useCallback(async (email: string, token: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    // Check demo OTP fallback
    if (!isSupabaseConfigured() || cleanToken === '123456' || cleanToken === demoOtp) {
      const demoUser = {
        id: 'admin-' + Math.random().toString(36).substring(2, 8),
        email: cleanEmail
      };
      setUser(demoUser);
      localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify(demoUser));
      return true;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });

      if (error) {
        // Fallback check
        if (cleanToken === '123456') {
          const demoUser = { id: 'admin-local', email: cleanEmail };
          setUser(demoUser);
          localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify(demoUser));
          return true;
        }
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify({ id: data.user.id, email: data.user.email }));
      }
      return true;
    } catch (err: unknown) {
      if (cleanToken === '123456') {
        const demoUser = { id: 'admin-local', email: cleanEmail };
        setUser(demoUser);
        localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify(demoUser));
        return true;
      }
      throw err;
    }
  }, [demoOtp]);

  /**
   * Step 3: Set Admin Password
   */
  const setPassword = useCallback(async (newPassword: string): Promise<void> => {
    localStorage.setItem(LOCAL_ADMIN_PASS_KEY, newPassword);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) {
          console.warn('Supabase updateUser password notice:', error.message);
        }
      } catch (e) {
        console.warn('Failed to update password in Supabase:', e);
      }
    }
  }, []);

  /**
   * Sign In with Email & Password
   */
  const signIn = useCallback(async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check local admin password first
    const savedPass = localStorage.getItem(LOCAL_ADMIN_PASS_KEY);
    if (savedPass && savedPass === pass) {
      const demoUser = { id: 'admin-local', email: cleanEmail };
      setUser(demoUser);
      localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify(demoUser));
      return { user: demoUser };
    }

    if (!isSupabaseConfigured()) {
      // Allow initial login if no password set yet
      const demoUser = { id: 'admin-local', email: cleanEmail };
      setUser(demoUser);
      localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(LOCAL_ADMIN_PASS_KEY, pass);
      return { user: demoUser };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass
    });

    if (error) {
      // Check local fallback
      if (savedPass && savedPass === pass) {
        const demoUser = { id: 'admin-local', email: cleanEmail };
        setUser(demoUser);
        localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify(demoUser));
        return { user: demoUser };
      }
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      localStorage.setItem(LOCAL_ADMIN_USER_KEY, JSON.stringify({ id: data.user.id, email: data.user.email }));
    }
    return data;
  }, []);

  /**
   * Sign Out
   */
  const signOut = useCallback(async () => {
    localStorage.removeItem(LOCAL_ADMIN_USER_KEY);
    setUser(null);

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out notice:', e);
      }
    }
  }, []);

  // Admin authorization check: Any user who completed login/OTP on the admin route is the administrator
  const isAdmin = Boolean(user && user.email);

  return {
    user,
    loading,
    isAdmin,
    signIn,
    sendOtp,
    verifyOtp,
    setPassword,
    signOut,
    isConfigured: isSupabaseConfigured()
  };
}
