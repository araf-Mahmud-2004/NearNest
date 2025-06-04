import { supabase } from "@/integrations/supabase/client";
import { Listing, Event, ListingInsert } from "@/types/supabase";

// Define EventInsert type since it might not be exported
type EventInsert = {
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  image?: string;
  user_id: string;
};

// Define Profile type with email field
type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

// Define types for listings/events with profile data
type ListingWithProfile = Listing & {
  profiles: Profile | null;
};

type EventWithProfile = Event & {
  profiles: Profile | null;
};

export const postsService = {
  // Helper function to ensure user has a profile
  async ensureUserProfile(): Promise<{ data: Profile | null; error: any }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || { message: "Not authenticated" },
      };
    }

    // Try to get existing profile
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return { data: existingProfile, error: null };
    }

    // If no profile exists, create one
    if (profileError?.code === "PGRST116") {
      // No rows returned
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: null,
          full_name: user.user_metadata?.full_name || null,
          email: user.email || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          bio: null,
        })
        .select("*")
        .single();

      return { data: newProfile, error: createError };
    }

    return { data: null, error: profileError };
  },

  // Listings
  async getListings(): Promise<{ data: Listing[] | null; error: any }> {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getListingsWithProfiles(): Promise<{
    data: ListingWithProfile[] | null;
    error: any;
  }> {
    // Get listings first
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (listingsError || !listings) {
      return { data: null, error: listingsError };
    }

    // Get profiles for all user_ids
    const userIds = [...new Set(listings.map(listing => listing.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, email, avatar_url, bio")
      .in("id", userIds);

    if (profilesError) {
      console.warn("Error fetching profiles:", profilesError);
    }

    // Combine listings with their profiles
    const listingsWithProfiles = listings.map(listing => ({
      ...listing,
      profiles: profiles?.find(profile => profile.id === listing.user_id) || null
    }));

    return { data: listingsWithProfiles, error: null };
  },

  async createListing(
    listing: ListingInsert
  ): Promise<{ data: Listing | null; error: any }> {
    // Ensure user has a profile first
    const { error: profileError } = await this.ensureUserProfile();
    if (profileError) {
      console.warn("Could not ensure user profile:", profileError);
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return { data: null, error: authError };
    }

    if (!user) {
      return { data: null, error: { message: "User must be authenticated" } };
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...listing,
        user_id: user.id,
      })
      .select("*")
      .single();

    return { data, error };
  },

  async updateListing(
    id: string,
    updates: Partial<Listing>
  ): Promise<{ data: Listing | null; error: any }> {
    const { data, error } = await supabase
      .from("listings")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    return { data, error };
  },

  async deleteListing(id: string): Promise<{ error: any }> {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    return { error };
  },

  // Events
  async getEvents(): Promise<{ data: Event[] | null; error: any }> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getEventsWithProfiles(): Promise<{
    data: EventWithProfile[] | null;
    error: any;
  }> {
    // Get events first
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (eventsError || !events) {
      return { data: null, error: eventsError };
    }

    // Get profiles for all user_ids
    const userIds = [...new Set(events.map(event => event.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, email, avatar_url, bio")
      .in("id", userIds);

    if (profilesError) {
      console.warn("Error fetching profiles:", profilesError);
    }

    // Combine events with their profiles
    const eventsWithProfiles = events.map(event => ({
      ...event,
      profiles: profiles?.find(profile => profile.id === event.user_id) || null
    }));

    return { data: eventsWithProfiles, error: null };
  },

  async createEvent(
    event: EventInsert
  ): Promise<{ data: Event | null; error: any }> {
    // Ensure user has a profile first
    const { error: profileError } = await this.ensureUserProfile();
    if (profileError) {
      console.warn("Could not ensure user profile:", profileError);
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return { data: null, error: authError };
    }

    if (!user) {
      return { data: null, error: { message: "User must be authenticated" } };
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        ...event,
        user_id: user.id,
      })
      .select("*")
      .single();

    return { data, error };
  },

  async updateEvent(
    id: string,
    updates: Partial<Event>
  ): Promise<{ data: Event | null; error: any }> {
    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    return { data, error };
  },

  async deleteEvent(id: string): Promise<{ error: any }> {
    const { error } = await supabase.from("events").delete().eq("id", id);
    return { error };
  },

  // Profile management
  async getCurrentUserProfile(): Promise<{ data: Profile | null; error: any }> {
    return this.ensureUserProfile();
  },

  async getProfile(
    userId: string
  ): Promise<{ data: Profile | null; error: any }> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  },

  async updateProfile(
    updates: Partial<Profile>
  ): Promise<{ data: Profile | null; error: any }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || { message: "Not authenticated" },
      };
    }

    // Ensure profile exists first
    await this.ensureUserProfile();

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .single();

    return { data, error };
  },

  async createProfile(profileData: {
    username?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
    bio?: string;
  }): Promise<{ data: Profile | null; error: any }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || { message: "Not authenticated" },
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: profileData.username || null,
        full_name: profileData.full_name || null,
        email: profileData.email || user.email || null,
        avatar_url: profileData.avatar_url || null,
        bio: profileData.bio || null,
      })
      .select("*")
      .single();

    return { data, error };
  },

  // Search functionality
  async searchListings(
    query: string
  ): Promise<{ data: ListingWithProfile[] | null; error: any }> {
    // Get listings first
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("*")
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
      )
      .order("created_at", { ascending: false });

    if (listingsError || !listings) {
      return { data: null, error: listingsError };
    }

    // Get profiles for all user_ids
    const userIds = [...new Set(listings.map(listing => listing.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, email, avatar_url, bio")
      .in("id", userIds);

    if (profilesError) {
      console.warn("Error fetching profiles:", profilesError);
    }

    // Combine listings with their profiles
    const listingsWithProfiles = listings.map(listing => ({
      ...listing,
      profiles: profiles?.find(profile => profile.id === listing.user_id) || null
    }));

    return { data: listingsWithProfiles, error: null };
  },

  async searchEvents(
    query: string
  ): Promise<{ data: EventWithProfile[] | null; error: any }> {
    // Get events first
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
      )
      .order("created_at", { ascending: false });

    if (eventsError || !events) {
      return { data: null, error: eventsError };
    }

    // Get profiles for all user_ids
    const userIds = [...new Set(events.map(event => event.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, email, avatar_url, bio")
      .in("id", userIds);

    if (profilesError) {
      console.warn("Error fetching profiles:", profilesError);
    }

    // Combine events with their profiles
    const eventsWithProfiles = events.map(event => ({
      ...event,
      profiles: profiles?.find(profile => profile.id === event.user_id) || null
    }));

    return { data: eventsWithProfiles, error: null };
  },

  // Get user's own listings/events
  async getUserListings(): Promise<{ data: Listing[] | null; error: any }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || { message: "Not authenticated" },
      };
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getUserEvents(): Promise<{ data: Event[] | null; error: any }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || { message: "Not authenticated" },
      };
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Helper function to get display name for a profile
  getDisplayName(profile: Profile | null): string {
    if (!profile) return "Anonymous";
    return profile.full_name || profile.username || "Anonymous";
  },

  // Legacy methods for backward compatibility
  async getUserInfo(userId: string) {
    const { data } = await this.getProfile(userId);
    return (
      data || {
        id: userId,
        username: null,
        avatar_url: null,
        full_name: null,
        email: null,
      }
    );
  },

  async getListingsWithUserInfo(): Promise<{
    data: ListingWithProfile[] | null;
    error: any;
  }> {
    return this.getListingsWithProfiles();
  },

  async getEventsWithUserInfo(): Promise<{
    data: EventWithProfile[] | null;
    error: any;
  }> {
    return this.getEventsWithProfiles();
  },

  // Real-time subscriptions
  subscribeToListings(callback: (payload: any) => void) {
    return supabase
      .channel("listings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listings",
        },
        callback
      )
      .subscribe();
  },

  subscribeToEvents(callback: (payload: any) => void) {
    return supabase
      .channel("events_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        callback
      )
      .subscribe();
  },

  subscribeToProfiles(callback: (payload: any) => void) {
    return supabase
      .channel("profiles_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        callback
      )
      .subscribe();
  },
};

export type { Profile, ListingWithProfile, EventWithProfile };
