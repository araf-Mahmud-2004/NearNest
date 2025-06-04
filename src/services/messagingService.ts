import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  post_id?: string;
  post_type?: 'listing' | 'event';
  post_title?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  recipient_profile?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  participant_1_profile?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  participant_2_profile?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count?: number;
}

export interface MessageInsert {
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  post_id?: string;
  post_type?: 'listing' | 'event';
  post_title?: string;
}

export const messagingService = {
  // Send a new message
  async sendMessage(messageData: Omit<MessageInsert, 'sender_id'>): Promise<{ data: Message | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: authError || { message: 'Not authenticated' } };
      }

      // First, ensure conversation exists
      const { data: conversation, error: convError } = await this.getOrCreateConversation(
        user.id,
        messageData.recipient_id
      );

      if (convError) {
        console.error('Error creating conversation:', convError);
        return { data: null, error: convError };
      }

      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          sender_id: user.id,
          conversation_id: conversation.id,
        })
        .select(`
          *,
          sender_profile:sender_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          recipient_profile:recipient_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error inserting message:', error);
        return { data: null, error };
      }

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message_id: data.id,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversation.id);

      return { data, error: null };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { data: null, error };
    }
  },

  // Get or create a conversation between two users
  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<{ data: Conversation; error: any }> {
    try {
      // Check if conversation already exists
      const { data: existingConv, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${user1Id},participant_2_id.eq.${user2Id}),and(participant_1_id.eq.${user2Id},participant_2_id.eq.${user1Id})`)
        .maybeSingle();

      if (existingConv) {
        return { data: existingConv, error: null };
      }

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Error searching conversations:', searchError);
        return { data: null, error: searchError };
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: user1Id,
          participant_2_id: user2Id,
          last_message_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        return { data: null, error: createError };
      }

      return { data: newConv, error: null };
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      return { data: null, error };
    }
  },

  // Get user's conversations
  async getConversations(userId: string): Promise<{ data: Conversation[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1_profile:participant_1_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          participant_2_profile:participant_2_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          last_message:last_message_id (
            id,
            content,
            sender_id,
            created_at
          )
        `)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return { data: [], error };
      }

      // Add unread count for each conversation
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv) => {
          try {
            const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('conversation_id', conv.id)
              .eq('recipient_id', userId)
              .eq('read', false);

            return {
              ...conv,
              unread_count: count || 0,
            };
          } catch (error) {
            console.error('Error getting unread count:', error);
            return {
              ...conv,
              unread_count: 0,
            };
          }
        })
      );

      return { data: conversationsWithUnread, error: null };
    } catch (error) {
      console.error('Error in getConversations:', error);
      return { data: [], error };
    }
  },

  // Get messages in a conversation
  async getMessages(conversationId: string, limit: number = 50): Promise<{ data: Message[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:sender_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          recipient_profile:recipient_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching messages:', error);
        return { data: [], error };
      }

      return { data: data?.reverse() || [], error: null };
    } catch (error) {
      console.error('Error in getMessages:', error);
      return { data: [], error };
    }
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
      }

      return { error };
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
      return { error };
    }
  },

  // Get unread message count
  async getUnreadCount(userId: string): Promise<{ data: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('recipient_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return { data: 0, error };
      }

      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return { data: 0, error };
    }
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
      }

      return { error };
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      return { error };
    }
  },

  // Search messages
  async searchMessages(userId: string, query: string): Promise<{ data: Message[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:sender_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          recipient_profile:recipient_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .or(`subject.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching messages:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in searchMessages:', error);
      return { data: [], error };
    }
  },

  // Subscribe to new messages
  subscribeToMessages(userId: string, callback: (payload: any) => void) {
    try {
      return supabase
        .channel(`messages_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${userId}`,
          },
          callback
        )
        .subscribe();
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return { unsubscribe: () => {} };
    }
  },

  // Subscribe to conversation updates
  subscribeToConversations(userId: string, callback: (payload: any) => void) {
    try {
      return supabase
        .channel(`conversations_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `or(participant_1_id.eq.${userId},participant_2_id.eq.${userId})`,
          },
          callback
        )
        .subscribe();
    } catch (error) {
      console.error('Error subscribing to conversations:', error);
      return { unsubscribe: () => {} };
    }
  },

  // Get conversation by ID
  async getConversation(conversationId: string): Promise<{ data: Conversation | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1_profile:participant_1_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          participant_2_profile:participant_2_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getConversation:', error);
      return { data: null, error };
    }
  },

  // Helper function to get display name
  getDisplayName(profile: any): string {
    if (!profile) return 'Unknown User';
    return profile.full_name || profile.username || 'Anonymous';
  },

  // Helper function to get other participant in conversation
  getOtherParticipant(conversation: Conversation, currentUserId: string) {
    if (conversation.participant_1_id === currentUserId) {
      return {
        id: conversation.participant_2_id,
        profile: conversation.participant_2_profile,
      };
    } else {
      return {
        id: conversation.participant_1_id,
        profile: conversation.participant_1_profile,
      };
    }
  },
};