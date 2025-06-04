import { useState, useEffect, useCallback } from 'react';
import { messagingService, Message, Conversation, MessageInsert } from '@/services/messagingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations with error handling
  const loadConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await messagingService.getConversations(user.id);
      if (error) {
        console.error('Error loading conversations:', error);
        setError('Failed to load conversations');
        setConversations([]);
      } else {
        setConversations(data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load messages for a conversation with error handling
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { data, error } = await messagingService.getMessages(conversationId);
      if (error) {
        console.error('Error loading messages:', error);
        setMessages(prev => ({
          ...prev,
          [conversationId]: [],
        }));
      } else {
        setMessages(prev => ({
          ...prev,
          [conversationId]: data || [],
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(prev => ({
        ...prev,
        [conversationId]: [],
      }));
    }
  }, [user]);

  // Send a message with error handling
  const sendMessage = useCallback(async (messageData: Omit<MessageInsert, 'sender_id'>) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    setSending(true);
    try {
      const { data, error } = await messagingService.sendMessage(messageData);
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
        return { success: false, error };
      } else {
        toast({
          title: 'Message sent',
          description: 'Your message has been sent successfully',
        });
        
        // Refresh conversations and messages
        await loadConversations();
        
        // Find the conversation and load its messages
        try {
          const { data: conversation } = await messagingService.getOrCreateConversation(
            user.id,
            messageData.recipient_id
          );
          if (conversation) {
            await loadMessages(conversation.id);
          }
        } catch (error) {
          console.error('Error refreshing conversation:', error);
        }
        
        return { success: true, data };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setSending(false);
    }
  }, [user, toast, loadConversations, loadMessages]);

  // Mark messages as read with error handling
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await messagingService.markMessagesAsRead(conversationId, user.id);
      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        // Update local state
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // Load unread count with error handling
  const loadUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const { data, error } = await messagingService.getUnreadCount(user.id);
      if (error) {
        console.error('Error loading unread count:', error);
        setUnreadCount(0);
      } else {
        setUnreadCount(data);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  }, [user]);

  // Delete a message with error handling
  const deleteMessage = useCallback(async (messageId: string, conversationId: string) => {
    try {
      const { error } = await messagingService.deleteMessage(messageId);
      if (error) {
        console.error('Error deleting message:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete message',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Message deleted',
          description: 'Message has been deleted',
        });
        await loadMessages(conversationId);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  }, [toast, loadMessages]);

  // Search messages with error handling
  const searchMessages = useCallback(async (query: string) => {
    if (!user || !query.trim()) return [];

    try {
      const { data, error } = await messagingService.searchMessages(user.id, query);
      if (error) {
        console.error('Error searching messages:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }, [user]);

  // Get conversation with another user
  const getConversationWith = useCallback(async (otherUserId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await messagingService.getOrCreateConversation(user.id, otherUserId);
      if (error) {
        console.error('Error getting conversation:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }, [user]);

  // Set up real-time subscriptions with error handling
  useEffect(() => {
    if (!user) return;

    let messageSubscription: any;
    let conversationSubscription: any;

    try {
      // Subscribe to new messages
      messageSubscription = messagingService.subscribeToMessages(user.id, (payload) => {
        console.log('New message received:', payload);
        loadConversations();
        loadUnreadCount();
        
        // Show notification for new message
        if (payload.new && payload.new.sender_id !== user.id) {
          toast({
            title: 'New message',
            description: 'You have a new message',
          });
        }
      });

      // Subscribe to conversation updates
      conversationSubscription = messagingService.subscribeToConversations(user.id, (payload) => {
        console.log('Conversation updated:', payload);
        loadConversations();
      });
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
    }

    return () => {
      try {
        if (messageSubscription) {
          messageSubscription.unsubscribe();
        }
        if (conversationSubscription) {
          conversationSubscription.unsubscribe();
        }
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    };
  }, [user, loadConversations, loadUnreadCount, toast]);

  // Load initial data with error handling
  useEffect(() => {
    if (user) {
      loadConversations();
      loadUnreadCount();
    } else {
      setConversations([]);
      setMessages({});
      setUnreadCount(0);
      setError(null);
    }
  }, [user, loadConversations, loadUnreadCount]);

  return {
    conversations,
    messages,
    unreadCount,
    loading,
    sending,
    error,
    sendMessage,
    loadMessages,
    markAsRead,
    deleteMessage,
    searchMessages,
    getConversationWith,
    loadConversations,
    loadUnreadCount,
  };
};