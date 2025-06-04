import { createClient } from "@supabase/supabase-js";
import { Database, Profile } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const profileService = {
  /**
   * Create a new user profile
   */
  async createProfile(
    profileData: ProfileInsert
  ): Promise<{ data: ProfileRow | null; error: string | null }> {
    try {
      // Validate required fields
      if (!profileData.username?.trim()) {
        return { data: null, error: "Username is required" };
      }

      if (!profileData.email?.trim()) {
        return { data: null, error: "Email is required" };
      }

      // Clean the username
      const cleanedData = {
        ...profileData,
        username: profileData.username.trim().toLowerCase(),
        email: profileData.email.trim().toLowerCase(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert(cleanedData)
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);

        // Handle specific error cases
        if (error.code === "23505") {
          if (error.message.includes("username")) {
            return { data: null, error: "Username is already taken" };
          }
          if (error.message.includes("email")) {
            return { data: null, error: "Email is already registered" };
          }
        }

        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error creating profile:", error);
      return { data: null, error: "Unexpected error occurred" };
    }
  },
  /**
   * Get a user profile by ID
   */
  async getProfile(
    userId: string
  ): Promise<{ data: ProfileRow | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      return { data: null, error: "Unexpected error occurred" };
    }
  },

  /**
   * Update a user profile
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<{ data: ProfileRow | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating profile:", error);
      return { data: null, error: "Unexpected error occurred" };
    }
  },

  /**
   * Check if a username is available
   */
  async isUsernameAvailable(
    username: string,
    excludeUserId?: string
  ): Promise<{ available: boolean; error: string | null }> {
    try {
      if (!username?.trim()) {
        return { available: false, error: "Username is required" };
      }

      const cleanUsername = username.trim().toLowerCase();

      // Basic username validation
      if (cleanUsername.length < 3) {
        return {
          available: false,
          error: "Username must be at least 3 characters long",
        };
      }

      if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        return {
          available: false,
          error: "Username can only contain letters, numbers, and underscores",
        };
      }

      let query = supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername);

      // If checking for update, exclude current user
      if (excludeUserId) {
        query = query.neq("id", excludeUserId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking username:", error);
        return { available: false, error: error.message };
      }

      // If no data found (PGRST116), username is available
      const available = !data;
      return { available, error: null };
    } catch (error) {
      console.error("Unexpected error checking username:", error);
      return { available: false, error: "Unexpected error occurred" };
    }
  },

  /**
   * Get profile by username
   */
  async getProfileByUsername(
    username: string
  ): Promise<{ data: ProfileRow | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.trim().toLowerCase())
        .single();

      if (error) {
        console.error("Error fetching profile by username:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error fetching profile by username:", error);
      return { data: null, error: "Unexpected error occurred" };
    }
  },
};
