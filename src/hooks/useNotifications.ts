import { useState, useEffect } from "react";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types/supabase";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        const [notificationsResult, unreadResult] = await Promise.all([
          notificationService.getUserNotifications(user.id),
          notificationService.getUnreadCount(user.id),
        ]);

        if (notificationsResult.data) {
          setNotifications(notificationsResult.data);
        }

        if (unreadResult.count !== null) {
          setUnreadCount(unreadResult.count);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const subscription = notificationService.subscribeToNotifications(
      user.id,
      (payload) => {
        if (payload.eventType === "INSERT") {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        } else if (payload.eventType === "UPDATE") {
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === payload.new.id ? payload.new : notification
            )
          );
          // Update unread count if notification was marked as read
          if (payload.old.read === false && payload.new.read === true) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        } else if (payload.eventType === "DELETE") {
          setNotifications(prev =>
            prev.filter(notification => notification.id !== payload.old.id)
          );
          // Update unread count if deleted notification was unread
          if (!payload.old.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};