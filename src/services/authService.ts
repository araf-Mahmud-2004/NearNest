import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { profileService } from "./profileService";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Sign up a new user and create their profile
   */
  async signUp(signUpData: SignUpData): Promise<{
    data: any;
    error: string | null;
  }> {
    try {
      // First check if username is available
      const { available, error: usernameError } =
        await profileService.isUsernameAvailable(signUpData.username);

      if (usernameError) {
        return { data: null, error: usernameError };
      }

      if (!available) {
        return { data: null, error: "Username is already taken" };
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            username: signUpData.username,
            full_name: signUpData.fullName || "",
          },
        },
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        return { data: null, error: authError.message };
      }

      if (!authData.user) {
        return { data: null, error: "Failed to create user" };
      }

      return {
        data: {
          user: authData.user,
          session: authData.session,
        },
        error: null,
      };
    } catch (error) {
      console.error("Unexpected signup error:", error);
      return {
        data: null,
        error: "An unexpected error occurred during signup",
      };
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(signInData: SignInData): Promise<{
    data: any;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      return {
        data: null,
        error: "An unexpected error occurred during sign in",
      };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected sign out error:", error);
      return { error: "An unexpected error occurred during sign out" };
    }
  },

  /**
   * Get the current user session
   */
  async getCurrentSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Get session error:", error);
        return { session: null, error: error.message };
      }

      return { session, error: null };
    } catch (error) {
      console.error("Unexpected get session error:", error);
      return { session: null, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get the current user
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Get user error:", error);
        return { user: null, error: error.message };
      }

      return { user, error: null };
    } catch (error) {
      console.error("Unexpected get user error:", error);
      return { user: null, error: "An unexpected error occurred" };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
