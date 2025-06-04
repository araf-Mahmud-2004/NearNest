import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { Listing, Event, ListingInsert, EventInsert } from "@/types/supabase";
import { postsService } from "@/services/postsService";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ListingWithProfile extends Listing {
  profiles?: {
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
  timeAgo?: string;
}

interface EventWithProfile extends Event {
  profiles?: {
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
}

interface PostsContextType {
  listings: ListingWithProfile[];
  events: EventWithProfile[];
  loading: boolean;
  addListing: (listing: Omit<ListingInsert, "user_id">) => Promise<void>;
  addEvent: (event: Omit<EventInsert, "user_id">) => Promise<void>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePost must be used within a PostsProvider");
  }
  return context;
};

export const PostsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [listings, setListings] = useState<ListingWithProfile[]>([]);
  const [events, setEvents] = useState<EventWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Memoized helper function to calculate time ago
  const getTimeAgo = useCallback((dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  }, []);

  // Memoized load data function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [listingsResult, eventsResult] = await Promise.all([
        postsService.getListingsWithProfiles(),
        postsService.getEventsWithProfiles()
      ]);

      if (listingsResult.error) {
        console.error("Error loading listings:", listingsResult.error);
        toast({
          title: "Error",
          description: "Failed to load listings",
          variant: "destructive",
        });
      } else if (listingsResult.data) {
        const listingsWithTimeAgo = listingsResult.data.map(listing => ({
          ...listing,
          timeAgo: getTimeAgo(listing.created_at)
        }));
        setListings(listingsWithTimeAgo);
      }

      if (eventsResult.error) {
        console.error("Error loading events:", eventsResult.error);
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        });
      } else if (eventsResult.data) {
        setEvents(eventsResult.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getTimeAgo, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    loadData();

    // Subscribe to listings changes
    const listingsSubscription = postsService.subscribeToListings(async (payload) => {
      console.log("Listings change:", payload);
      
      if (payload.eventType === "INSERT") {
        // Fetch profile data for the new listing
        const { data: profile } = await postsService.getProfile(payload.new.user_id);
        
        const newListing = {
          ...payload.new,
          timeAgo: getTimeAgo(payload.new.created_at),
          profiles: profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
            full_name: profile.full_name
          } : undefined
        };
        setListings(prev => [newListing, ...prev]);
        
        toast({
          title: "New Listing",
          description: `${payload.new.title} has been posted`,
        });
      } else if (payload.eventType === "UPDATE") {
        // For updates, handle async profile fetching properly
        const handleUpdate = async () => {
          const { data: profile } = await postsService.getProfile(payload.new.user_id);
          const profiles = profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
            full_name: profile.full_name
          } : undefined;

          setListings(prev => prev.map(listing => 
            listing.id === payload.new.id 
              ? { 
                  ...payload.new, 
                  timeAgo: getTimeAgo(payload.new.created_at),
                  profiles: profiles || listing.profiles
                }
              : listing
          ));
        };
        handleUpdate();
      } else if (payload.eventType === "DELETE") {
        setListings(prev => prev.filter(listing => listing.id !== payload.old.id));
      }
    });

    // Subscribe to events changes
    const eventsSubscription = postsService.subscribeToEvents(async (payload) => {
      console.log("Events change:", payload);
      
      if (payload.eventType === "INSERT") {
        // Fetch profile data for the new event
        const { data: profile } = await postsService.getProfile(payload.new.user_id);
        
        const newEvent = {
          ...payload.new,
          profiles: profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
            full_name: profile.full_name
          } : undefined
        };
        setEvents(prev => [newEvent, ...prev]);
        
        toast({
          title: "New Event",
          description: `${payload.new.title} has been posted`,
        });
      } else if (payload.eventType === "UPDATE") {
        // For updates, handle async profile fetching properly
        const handleUpdate = async () => {
          const { data: profile } = await postsService.getProfile(payload.new.user_id);
          const profiles = profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
            full_name: profile.full_name
          } : undefined;

          setEvents(prev => prev.map(event => 
            event.id === payload.new.id 
              ? { 
                  ...payload.new,
                  profiles: profiles || event.profiles
                }
              : event
          ));
        };
        handleUpdate();
      } else if (payload.eventType === "DELETE") {
        setEvents(prev => prev.filter(event => event.id !== payload.old.id));
      }
    });

    // Cleanup subscriptions
    return () => {
      listingsSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
    };
  }, [getTimeAgo, toast]);

  const addListing = async (newListing: Omit<ListingInsert, "user_id">) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a listing",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await postsService.createListing({
        ...newListing,
        user_id: user.id,
      });

      if (error) {
        console.error("Error creating listing:", error);
        toast({
          title: "Error",
          description: "Failed to create listing",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Listing created successfully",
        });
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive",
      });
    }
  };

  const addEvent = async (newEvent: Omit<EventInsert, "user_id">) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create an event",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await postsService.createEvent({
        ...newEvent,
        user_id: user.id,
      });

      if (error) {
        console.error("Error creating event:", error);
        toast({
          title: "Error",
          description: "Failed to create event",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    try {
      const { data, error } = await postsService.updateListing(id, updates);

      if (error) {
        console.error("Error updating listing:", error);
        toast({
          title: "Error",
          description: "Failed to update listing",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Listing updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const { data, error } = await postsService.updateEvent(id, updates);

      if (error) {
        console.error("Error updating event:", error);
        toast({
          title: "Error",
          description: "Failed to update event",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const { error } = await postsService.deleteListing(id);

      if (error) {
        console.error("Error deleting listing:", error);
        toast({
          title: "Error",
          description: "Failed to delete listing",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Listing deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await postsService.deleteEvent(id);

      if (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    listings, 
    events, 
    loading,
    addListing, 
    addEvent,
    updateListing,
    updateEvent,
    deleteListing,
    deleteEvent,
    refreshData
  }), [listings, events, loading, refreshData]);

  return (
    <PostsContext.Provider value={contextValue}>
      {children}
    </PostsContext.Provider>
  );
};
