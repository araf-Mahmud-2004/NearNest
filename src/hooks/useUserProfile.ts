import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { profileService } from "@/services/profileService";
import { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setError(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: profileError } = await profileService.getProfile(
          user.id
        );

        if (profileError) {
          setError(profileError);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError("Failed to fetch profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error: profileError } = await profileService.getProfile(
        user.id
      );

      if (profileError) {
        setError(profileError);
      } else {
        setProfile(data);
        setError(null);
      }
    } catch (err) {
      setError("Failed to refresh profile");
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refreshProfile,
    username: profile?.username || null,
    fullName: profile?.full_name || null,
    avatarUrl: profile?.avatar_url || null,
  };
};
