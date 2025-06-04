import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface WebSocketMessage {
  type: 'interaction' | 'listing_update' | 'event_update' | 'profile_update';
  payload: any;
  timestamp: string;
}

export class WebSocketService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();

  // Subscribe to user interactions
  subscribeToUserInteractions(userId: string, callback: (message: WebSocketMessage) => void): () => void {
    const channelName = `user_interactions_${userId}`;
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_interactions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const message: WebSocketMessage = {
              type: 'interaction',
              payload,
              timestamp: new Date().toISOString()
            };
            this.notifyListeners(channelName, message);
          }
        )
        .subscribe();
      
      this.channels.set(channelName, channel);
      this.listeners.set(channelName, new Set());
    }

    // Add callback to listeners
    const channelListeners = this.listeners.get(channelName)!;
    channelListeners.add(callback);

    // Return unsubscribe function
    return () => {
      channelListeners.delete(callback);
      if (channelListeners.size === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          channel.unsubscribe();
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
      }
    };
  }

  // Subscribe to post interactions (for post owners)
  subscribeToPostInteractions(postIds: string[], callback: (message: WebSocketMessage) => void): () => void {
    const channelName = `post_interactions_${postIds.join('_')}`;
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_interactions',
            filter: `post_id=in.(${postIds.join(',')})`
          },
          (payload) => {
            const message: WebSocketMessage = {
              type: 'interaction',
              payload,
              timestamp: new Date().toISOString()
            };
            this.notifyListeners(channelName, message);
          }
        )
        .subscribe();
      
      this.channels.set(channelName, channel);
      this.listeners.set(channelName, new Set());
    }

    // Add callback to listeners
    const channelListeners = this.listeners.get(channelName)!;
    channelListeners.add(callback);

    // Return unsubscribe function
    return () => {
      channelListeners.delete(callback);
      if (channelListeners.size === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          channel.unsubscribe();
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
      }
    };
  }

  // Subscribe to listings updates
  subscribeToListings(callback: (message: WebSocketMessage) => void): () => void {
    const channelName = 'listings_updates';
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'listings'
          },
          (payload) => {
            const message: WebSocketMessage = {
              type: 'listing_update',
              payload,
              timestamp: new Date().toISOString()
            };
            this.notifyListeners(channelName, message);
          }
        )
        .subscribe();
      
      this.channels.set(channelName, channel);
      this.listeners.set(channelName, new Set());
    }

    // Add callback to listeners
    const channelListeners = this.listeners.get(channelName)!;
    channelListeners.add(callback);

    // Return unsubscribe function
    return () => {
      channelListeners.delete(callback);
      if (channelListeners.size === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          channel.unsubscribe();
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
      }
    };
  }

  // Subscribe to events updates
  subscribeToEvents(callback: (message: WebSocketMessage) => void): () => void {
    const channelName = 'events_updates';
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events'
          },
          (payload) => {
            const message: WebSocketMessage = {
              type: 'event_update',
              payload,
              timestamp: new Date().toISOString()
            };
            this.notifyListeners(channelName, message);
          }
        )
        .subscribe();
      
      this.channels.set(channelName, channel);
      this.listeners.set(channelName, new Set());
    }

    // Add callback to listeners
    const channelListeners = this.listeners.get(channelName)!;
    channelListeners.add(callback);

    // Return unsubscribe function
    return () => {
      channelListeners.delete(callback);
      if (channelListeners.size === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          channel.unsubscribe();
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
      }
    };
  }

  // Subscribe to profile updates
  subscribeToProfiles(callback: (message: WebSocketMessage) => void): () => void {
    const channelName = 'profiles_updates';
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            const message: WebSocketMessage = {
              type: 'profile_update',
              payload,
              timestamp: new Date().toISOString()
            };
            this.notifyListeners(channelName, message);
          }
        )
        .subscribe();
      
      this.channels.set(channelName, channel);
      this.listeners.set(channelName, new Set());
    }

    // Add callback to listeners
    const channelListeners = this.listeners.get(channelName)!;
    channelListeners.add(callback);

    // Return unsubscribe function
    return () => {
      channelListeners.delete(callback);
      if (channelListeners.size === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          channel.unsubscribe();
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
      }
    };
  }

  // Notify all listeners for a channel
  private notifyListeners(channelName: string, message: WebSocketMessage): void {
    const listeners = this.listeners.get(channelName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.channels.forEach((channel, channelName) => {
      channel.unsubscribe();
    });
    this.channels.clear();
    this.listeners.clear();
  }

  // Get connection status
  getConnectionStatus(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' {
    // Supabase doesn't expose connection status directly, so we'll return a default
    return 'OPEN';
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();