import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { profileService } from "@/services/profileService";
import { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  username: string | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  changePassword?: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  deleteAccount?: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile on user/session change with error handling
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && session) {
        try {
          const { data: profileData, error } = await profileService.getProfile(user.id);
          if (error) {
            console.warn("Profile fetch error:", error);
            // Don't set profile to null if there's an error - keep existing state
            return;
          }
          setProfile(profileData);
        } catch (error) {
          console.error("Unexpected error fetching profile:", error);
          // Don't redirect to login on profile errors
        }
      } else {
        // Only clear profile if user is actually null
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user, session]);

  // Ensure profile exists after login with better error handling
  useEffect(() => {
    const createProfileIfMissing = async () => {
      if (user && session) {
        try {
          const { data: profileData, error: fetchError } = await profileService.getProfile(user.id);
          
          if (fetchError) {
            console.warn("Profile fetch error during creation check:", fetchError);
            // Try to create profile anyway if fetch fails
          }
          
          setProfile(profileData);
          
          if (!profileData) {
            console.log("Creating missing profile for user:", user.id);
            const { data: newProfile, error: createError } = await profileService.createProfile({
              id: user.id,
              username: user.user_metadata?.username || user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || "",
              avatar_url: user.user_metadata?.avatar_url || "",
              bio: "",
              location: "",
              twitter: "",
              linkedin: "",
              facebook: "",
              website: "",
            });
            
            if (createError) {
              console.error("Error creating profile:", createError);
              // Don't redirect to login on profile creation errors
            } else {
              setProfile(newProfile);
            }
          }
        } catch (error) {
          console.error("Unexpected error in profile creation:", error);
          // Don't redirect to login on unexpected errors
        }
      }
    };
    createProfileIfMissing();
  }, [user, session]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const changePassword = async (
    _currentPassword: string,
    newPassword: string
  ) => {
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const deleteAccount = async () => {
    if (!user) throw new Error("Not authenticated");
    // Scramble email to block login
    await supabase.auth.updateUser({ email: `deleted+${user.id}@example.com` });
    await profileService.updateProfile(user.id, {
      username: `deleted_${user.id}`,
      // deleted: true, // Add this field to your profile table if you want
    });
    await signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    username: profile?.username || null,
    loading,
    profileLoading: false,
    signOut,
    refreshProfile: async () => {
      if (user) {
        const { data: profileData } = await profileService.getProfile(user.id);
        setProfile(profileData);
      }
    },
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
