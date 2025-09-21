"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { AuthState, AuthContextType, UserProfile, SignUpData } from "@/types";
import { authClient } from "@/lib/supabase";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  // Simple function to fetch user profile
  const fetchUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const { profile, error } = await authClient.getUserProfile(user.id);
      if (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
      }
      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Initialize authentication
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get current session
        const session = await authClient.getCurrentSession();
        
        if (!mounted) return;

        if (session?.user) {
          // User is authenticated
          const profile = await fetchUserProfile(session.user);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else {
          // No user session
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: "Failed to initialize authentication",
          });
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = authClient.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);

        if (event === "SIGNED_IN" && session) {
          const profile = await fetchUserProfile(session.user);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else if (event === "SIGNED_OUT") {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authClient.signIn(email, password);

    if (result.error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: result.error || "Login failed",
      }));
      return { error: result.error };
    }

    return {};
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    profileData: SignUpData
  ): Promise<{ error?: string }> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authClient.signUp(email, password);

    if (result.error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: result.error || "Signup failed",
      }));
      return { error: result.error };
    }

    setState((prev) => ({ ...prev, loading: false }));
    console.log("Profile data for future creation:", profileData);
    return {};
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authClient.signOut();

    if (result.error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: result.error || "Logout failed",
      }));
    }
  };

  // Refresh profile function
  const refreshProfile = async (): Promise<void> => {
    if (!state.user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const profile = await fetchUserProfile(state.user);

    setState((prev) => ({
      ...prev,
      profile,
      loading: false,
    }));
  };

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
