import { useEffect, useRef, useCallback } from 'react';
import { webSocketService, WebSocketMessage } from '@/services/websocketService';

export interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { onMessage, onError, enabled = true } = options;
  const unsubscribeFunctions = useRef<(() => void)[]>([]);

  // Subscribe to user interactions
  const subscribeToUserInteractions = useCallback((userId: string, callback?: (message: WebSocketMessage) => void) => {
    if (!enabled) return () => {};

    const unsubscribe = webSocketService.subscribeToUserInteractions(userId, (message) => {
      try {
        callback?.(message);
        onMessage?.(message);
      } catch (error) {
        onError?.(error as Error);
      }
    });

    unsubscribeFunctions.current.push(unsubscribe);
    return unsubscribe;
  }, [enabled, onMessage, onError]);

  // Subscribe to post interactions
  const subscribeToPostInteractions = useCallback((postIds: string[], callback?: (message: WebSocketMessage) => void) => {
    if (!enabled || postIds.length === 0) return () => {};

    const unsubscribe = webSocketService.subscribeToPostInteractions(postIds, (message) => {
      try {
        callback?.(message);
        onMessage?.(message);
      } catch (error) {
        onError?.(error as Error);
      }
    });

    unsubscribeFunctions.current.push(unsubscribe);
    return unsubscribe;
  }, [enabled, onMessage, onError]);

  // Subscribe to listings updates
  const subscribeToListings = useCallback((callback?: (message: WebSocketMessage) => void) => {
    if (!enabled) return () => {};

    const unsubscribe = webSocketService.subscribeToListings((message) => {
      try {
        callback?.(message);
        onMessage?.(message);
      } catch (error) {
        onError?.(error as Error);
      }
    });

    unsubscribeFunctions.current.push(unsubscribe);
    return unsubscribe;
  }, [enabled, onMessage, onError]);

  // Subscribe to events updates
  const subscribeToEvents = useCallback((callback?: (message: WebSocketMessage) => void) => {
    if (!enabled) return () => {};

    const unsubscribe = webSocketService.subscribeToEvents((message) => {
      try {
        callback?.(message);
        onMessage?.(message);
      } catch (error) {
        onError?.(error as Error);
      }
    });

    unsubscribeFunctions.current.push(unsubscribe);
    return unsubscribe;
  }, [enabled, onMessage, onError]);

  // Subscribe to profile updates
  const subscribeToProfiles = useCallback((callback?: (message: WebSocketMessage) => void) => {
    if (!enabled) return () => {};

    const unsubscribe = webSocketService.subscribeToProfiles((message) => {
      try {
        callback?.(message);
        onMessage?.(message);
      } catch (error) {
        onError?.(error as Error);
      }
    });

    unsubscribeFunctions.current.push(unsubscribe);
    return unsubscribe;
  }, [enabled, onMessage, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFunctions.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from WebSocket:', error);
        }
      });
      unsubscribeFunctions.current = [];
    };
  }, []);

  return {
    subscribeToUserInteractions,
    subscribeToPostInteractions,
    subscribeToListings,
    subscribeToEvents,
    subscribeToProfiles,
    connectionStatus: webSocketService.getConnectionStatus(),
  };
};

// Specialized hook for activity tracking
export const useActivityTracking = (userId?: string) => {
  const { subscribeToUserInteractions, subscribeToPostInteractions } = useWebSocket();

  const trackUserActivity = useCallback((callback: (message: WebSocketMessage) => void) => {
    if (!userId) return () => {};
    return subscribeToUserInteractions(userId, callback);
  }, [userId, subscribeToUserInteractions]);

  const trackPostActivity = useCallback((postIds: string[], callback: (message: WebSocketMessage) => void) => {
    return subscribeToPostInteractions(postIds, callback);
  }, [subscribeToPostInteractions]);

  return {
    trackUserActivity,
    trackPostActivity,
  };
};

// Specialized hook for real-time content updates
export const useRealTimeUpdates = () => {
  const { subscribeToListings, subscribeToEvents, subscribeToProfiles } = useWebSocket();

  const trackListings = useCallback((callback: (message: WebSocketMessage) => void) => {
    return subscribeToListings(callback);
  }, [subscribeToListings]);

  const trackEvents = useCallback((callback: (message: WebSocketMessage) => void) => {
    return subscribeToEvents(callback);
  }, [subscribeToEvents]);

  const trackProfiles = useCallback((callback: (message: WebSocketMessage) => void) => {
    return subscribeToProfiles(callback);
  }, [subscribeToProfiles]);

  return {
    trackListings,
    trackEvents,
    trackProfiles,
  };
};