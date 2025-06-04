import React, { useState } from "react";
import { Bell, X, Heart, Calendar, ShoppingBag, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterestedPersonProfile } from "@/components/InterestedPersonProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

export const RealTimeNotifications: React.FC = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  if (!user) return null;

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'interest':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'listing':
        return <ShoppingBag className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification data
    if (notification.data?.post_id) {
      const postType = notification.data.post_type;
      if (postType === 'event') {
        // Navigate to events page or specific event
        window.location.href = '/events';
      } else if (postType === 'listing') {
        // Navigate to listings page or specific listing
        window.location.href = '/listings';
      }
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Mark all read"
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications yet
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 10).map((notification) => {
                  const isInterestNotification = notification.type === "interest";
                  const interestedProfile = (notification as any).interested_user_profile;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors group ${
                        notification.read 
                          ? "bg-muted/50 border-muted" 
                          : "bg-background border-primary/20 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getNotificationIcon(notification.type)}
                            <Badge 
                              variant="secondary"
                              className="text-xs"
                            >
                              {notification.type === "interest" ? "Interest" : 
                               notification.type === "event" ? "Event" : 
                               notification.type === "listing" ? "Listing" : 
                               notification.type}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>

                          {/* Profile section for interest notifications */}
                          {isInterestNotification && interestedProfile && (
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={interestedProfile.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {(interestedProfile.full_name || interestedProfile.username).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {interestedProfile.full_name || interestedProfile.username}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  @{interestedProfile.username}
                                </p>
                              </div>
                              {/* View Profile Button */}
                              <InterestedPersonProfile
                                profile={interestedProfile}
                                postTitle={notification.data?.post_title || "your post"}
                                postType={notification.data?.post_type || "listing"}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!notification.read) {
                                      markAsRead(notification.id);
                                    }
                                  }}
                                >
                                  <User className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </InterestedPersonProfile>
                            </div>
                          )}

                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.created_at)}
                          </p>

                          {/* Action buttons for non-interest notifications */}
                          {!isInterestNotification && (
                            <div className="mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNotificationClick(notification)}
                                className="text-xs"
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};