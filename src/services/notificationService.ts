import { supabase } from "@/integrations/supabase/client";
import { NotificationInsert } from "@/types/supabase";

export const notificationService = {
  // Get all notifications for a user with profile information
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // For notifications with interested_user_id in data, fetch the profile
    if (data) {
      const enrichedNotifications = await Promise.all(
        data.map(async (notification) => {
          if (notification.data?.interested_user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, username, full_name, avatar_url")
              .eq("id", notification.data.interested_user_id)
              .single();
            
            return {
              ...notification,
              interested_user_profile: profile
            };
          }
          return notification;
        })
      );
      
      return { data: enrichedNotifications, error };
    }

    return { data, error };
  },

  // Get unread notification count
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    return { count, error };
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .select()
      .single();

    return { data, error };
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    return { data, error };
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    return { error };
  },

  // Create notification
  async createNotification(notification: NotificationInsert) {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    return { data, error };
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};