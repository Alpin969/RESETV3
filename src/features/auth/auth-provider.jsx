"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { deviceTimezone } from "@/lib/utils/timezones";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (nextUser) => {
    if (!nextUser) {
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, timezone")
        .eq("id", nextUser.id)
        .maybeSingle();
      if (error) {
        setProfile(null);
        return null;
      }
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function bootstrap() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) {
          return;
        }
        const sessionUser = data.session?.user || null;
        setUser(sessionUser);
        if (sessionUser) {
          await loadProfile(sessionUser);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) {
          return;
        }
        const nextUser = session?.user || null;
        setUser(nextUser);
        setLoading(false);
        if (!nextUser) {
          setProfile(null);
          return;
        }
        window.setTimeout(() => {
          if (active) {
            loadProfile(nextUser);
          }
        }, 0);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async ({ email, password }) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: String(email || "").trim(),
        password,
      });
      if (error) {
        throw error;
      }
      if (!data.session) {
        throw new Error("Sesi login tidak diterima dari server. Silakan coba lagi.");
      }
      setUser(data.user);
      await loadProfile(data.user);
      return data;
    },
    [loadProfile]
  );

  const signUp = useCallback(
    async ({ username, email, password, timezone }) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: String(email || "").trim(),
        password,
        options: {
          data: {
            username: String(username || "").trim(),
            timezone: timezone || deviceTimezone(),
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data.user || !data.session) {
        const confirmation = new Error(
          "Akun dibuat, tetapi sesi login belum aktif. Silakan masuk lewat halaman Login."
        );
        confirmation.code = "confirmation_required";
        throw confirmation;
      }
      setUser(data.user);
      await loadProfile(data.user);
      return data;
    },
    [loadProfile]
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    if (error) {
      throw error;
    }
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(
      String(email || "").trim(),
      { redirectTo }
    );
    if (error) {
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (password) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const nextUser = data.user || null;
    if (nextUser) {
      setUser(nextUser);
      return loadProfile(nextUser);
    }
    setUser(null);
    setProfile(null);
    return null;
  }, [loadProfile]);

  const updateLocalProfile = useCallback((partial) => {
    setProfile((current) => (current ? { ...current, ...partial } : current));
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
      updateLocalProfile,
    }),
    [
      user,
      profile,
      loading,
      profileLoading,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
      updateLocalProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }
  return context;
}