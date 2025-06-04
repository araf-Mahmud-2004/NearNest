import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";

export interface InteractionEvent {
  id?: string;
  user_id: string;
  post_id: string;
  post_type: 'listing' | 'event';
  interaction_type: 'view' | 'contact' | 'interest' | 'profile_view';
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface ViewActivity {
  id: string;
  user_id: string;
  post_id: string;
  post_type: 'listing' | 'event';
  post_title: string;
  post_owner_id: string;
  interaction_type: 'view' | 'contact' | 'interest' | 'profile_view';
  created_at: string;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const trackingService = {
  // Log user interactions
  async logInteraction(interaction: Omit<InteractionEvent, 'id' | 'created_at'>): Promise<{ data: InteractionEvent | null; error: any }> {
    const { data, error } = await supabase
      .from('user_interactions')
      .insert(interaction)
      .select('*')
      .single();

    return { data, error };
  },

  // Track post views
  async trackView(postId: string, postType: 'listing' | 'event', postOwnerId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.id === postOwnerId) {
      return; // Don't track own views
    }

    await this.logInteraction({
      user_id: user.id,
      post_id: postId,
      post_type: postType,
      interaction_type: 'view',
      metadata: { timestamp: new Date().toISOString() }
    });
  },

  // Track contact attempts
  async trackContact(postId: string, postType: 'listing' | 'event', postOwnerId: string, contactMethod: string, postTitle?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Log the interaction
    await this.logInteraction({
      user_id: user.id,
      post_id: postId,
      post_type: postType,
      interaction_type: 'contact',
      metadata: { 
        contact_method: contactMethod,
        timestamp: new Date().toISOString()
      }
    });

    // Create notification for post owner
    if (postOwnerId !== user.id) {
      // Get user profile for notification
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();

      const displayName = userProfile?.full_name || userProfile?.username || 'Someone';
      
      await notificationService.createNotification({
        user_id: postOwnerId,
        type: 'contact',
        title: `${displayName} wants to contact you!`,
        message: `${displayName} is interested in contacting you about "${postTitle || 'your post'}"`,
        data: {
          post_id: postId,
          post_type: postType,
          post_title: postTitle,
          contact_method: contactMethod,
          interested_user_id: user.id
        }
      });
    }
  },

  // Track interest in posts
  async trackInterest(postId: string, postType: 'listing' | 'event', postOwnerId: string, postTitle?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Log the interaction
    await this.logInteraction({
      user_id: user.id,
      post_id: postId,
      post_type: postType,
      interaction_type: 'interest',
      metadata: { 
        timestamp: new Date().toISOString()
      }
    });

    // Create notification for post owner
    if (postOwnerId !== user.id) {
      // Get user profile for notification
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();

      const displayName = userProfile?.full_name || userProfile?.username || 'Someone';
      
      await notificationService.createNotification({
        user_id: postOwnerId,
        type: 'interest',
        title: `${displayName} is interested in your ${postType}!`,
        message: `${displayName} showed interest in "${postTitle || 'your post'}"`,
        data: {
          post_id: postId,
          post_type: postType,
          post_title: postTitle,
          interested_user_id: user.id
        }
      });
    }
  },

  // Track profile views
  async trackProfileView(profileId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.id === profileId) {
      return; // Don't track own profile views
    }

    await this.logInteraction({
      user_id: user.id,
      post_id: profileId, // Using post_id field for profile_id
      post_type: 'listing', // Default value, not used for profile views
      interaction_type: 'profile_view',
      metadata: { timestamp: new Date().toISOString() }
    });
  },

  // Get recent activity for a user's posts
  async getRecentActivity(userId: string, limit: number = 20): Promise<{ data: ViewActivity[] | null; error: any }> {
    // First get the user's posts
    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, user_id')
      .eq('user_id', userId);

    const { data: events } = await supabase
      .from('events')
      .select('id, title, user_id')
      .eq('user_id', userId);

    const userPostIds = [
      ...(listings || []).map(l => l.id),
      ...(events || []).map(e => e.id)
    ];

    if (userPostIds.length === 0) {
      return { data: [], error: null };
    }

    // Get interactions on user's posts
    const { data: interactions, error } = await supabase
      .from('user_interactions')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .in('post_id', userPostIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    // Enrich with post details
    const enrichedActivities: ViewActivity[] = [];
    
    for (const interaction of interactions || []) {
      let postTitle = 'Unknown Post';
      let postOwnerId = userId;
      
      // Find the post title
      const listing = listings?.find(l => l.id === interaction.post_id);
      const event = events?.find(e => e.id === interaction.post_id);
      
      if (listing) {
        postTitle = listing.title;
        postOwnerId = listing.user_id;
      } else if (event) {
        postTitle = event.title;
        postOwnerId = event.user_id;
      }

      enrichedActivities.push({
        id: interaction.id,
        user_id: interaction.user_id,
        post_id: interaction.post_id,
        post_type: interaction.post_type,
        post_title: postTitle,
        post_owner_id: postOwnerId,
        interaction_type: interaction.interaction_type,
        created_at: interaction.created_at,
        profiles: interaction.profiles
      });
    }

    return { data: enrichedActivities, error: null };
  },

  // Get activity stats for a user
  async getActivityStats(userId: string): Promise<{ 
    data: { 
      total_views: number; 
      total_contacts: number; 
      total_interests: number;
      recent_viewers: number;
    } | null; 
    error: any 
  }> {
    // Get user's posts
    const { data: listings } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', userId);

    const { data: events } = await supabase
      .from('events')
      .select('id')
      .eq('user_id', userId);

    const userPostIds = [
      ...(listings || []).map(l => l.id),
      ...(events || []).map(e => e.id)
    ];

    if (userPostIds.length === 0) {
      return { 
        data: { 
          total_views: 0, 
          total_contacts: 0, 
          total_interests: 0,
          recent_viewers: 0
        }, 
        error: null 
      };
    }

    // Get interaction counts
    const { data: viewCount } = await supabase
      .from('user_interactions')
      .select('id', { count: 'exact' })
      .in('post_id', userPostIds)
      .eq('interaction_type', 'view');

    const { data: contactCount } = await supabase
      .from('user_interactions')
      .select('id', { count: 'exact' })
      .in('post_id', userPostIds)
      .eq('interaction_type', 'contact');

    const { data: interestCount } = await supabase
      .from('user_interactions')
      .select('id', { count: 'exact' })
      .in('post_id', userPostIds)
      .eq('interaction_type', 'interest');

    // Get recent viewers (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentViewers } = await supabase
      .from('user_interactions')
      .select('user_id', { count: 'exact' })
      .in('post_id', userPostIds)
      .eq('interaction_type', 'view')
      .gte('created_at', yesterday.toISOString());

    return {
      data: {
        total_views: viewCount?.length || 0,
        total_contacts: contactCount?.length || 0,
        total_interests: interestCount?.length || 0,
        recent_viewers: recentViewers?.length || 0
      },
      error: null
    };
  },

  // Subscribe to real-time interaction updates
  subscribeToInteractions(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_interactions_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_interactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to interactions on user's posts
  subscribeToPostInteractions(postIds: string[], callback: (payload: any) => void) {
    return supabase
      .channel('post_interactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_interactions',
          filter: `post_id=in.(${postIds.join(',')})`
        },
        callback
      )
      .subscribe();
  }
};