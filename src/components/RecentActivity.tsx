import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Eye, MessageCircle, Heart, User, ExternalLink, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '@/lib/timeUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { trackingService, ViewActivity } from '@/services/trackingService';
import { useToast } from '@/hooks/use-toast';

interface RecentActivityProps {
  userId?: string;
  limit?: number;
  showHeader?: boolean;
}

const getInteractionIcon = (type: string) => {
  switch (type) {
    case 'view':
      return <Eye className="h-4 w-4" />;
    case 'contact':
      return <MessageCircle className="h-4 w-4" />;
    case 'interest':
      return <Heart className="h-4 w-4" />;
    case 'profile_view':
      return <User className="h-4 w-4" />;
    default:
      return <Eye className="h-4 w-4" />;
  }
};

const getInteractionColor = (type: string) => {
  switch (type) {
    case 'view':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'contact':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'interest':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'profile_view':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getInteractionText = (type: string) => {
  switch (type) {
    case 'view':
      return 'viewed';
    case 'contact':
      return 'contacted about';
    case 'interest':
      return 'showed interest in';
    case 'profile_view':
      return 'viewed your profile';
    default:
      return 'interacted with';
  }
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  userId,
  limit = 20,
  showHeader = true
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ViewActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const targetUserId = userId || user?.id;

  // Fetch activities from the database
  const fetchActivities = useCallback(async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await trackingService.getRecentActivity(targetUserId, limit);
      
      if (fetchError) {
        console.error('Error fetching activities:', fetchError);
        setError('Failed to load recent activity');
        setActivities([]);
      } else {
        setActivities(data || []);
        setError(null);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Unexpected error fetching activities:', err);
      setError('Failed to load recent activity');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, limit]);

  // Initial load
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!targetUserId) return;

    // Subscribe to interactions on user's posts
    const subscription = trackingService.subscribeToPostInteractions(
      [], // We'll get post IDs dynamically
      (payload) => {
        console.log('Real-time interaction update:', payload);
        // Refresh activities when new interactions occur
        fetchActivities();
        
        // Show toast notification for new interactions
        if (payload.eventType === 'INSERT' && payload.new) {
          const interaction = payload.new;
          if (interaction.interaction_type === 'view') {
            toast({
              title: "New view on your post!",
              description: "Someone viewed one of your posts",
            });
          } else if (interaction.interaction_type === 'interest') {
            toast({
              title: "Someone showed interest!",
              description: "Someone is interested in your post",
            });
          } else if (interaction.interaction_type === 'contact') {
            toast({
              title: "New contact!",
              description: "Someone contacted you about your post",
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [targetUserId, fetchActivities, toast]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchActivities();
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  const handleViewPost = (postId: string, postType: string) => {
    if (postType === 'listing') {
      navigate(`/listings`);
    } else {
      navigate(`/events`);
    }
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent activity to show
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Updated {formatRelativeTime(lastUpdate.toISOString())}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 cursor-pointer" onClick={() => handleViewProfile(activity.user_id)}>
                    <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {activity.profiles?.full_name || activity.profiles?.username || 'Anonymous'}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getInteractionColor(activity.interaction_type)}`}
                      >
                        {getInteractionIcon(activity.interaction_type)}
                        <span className="ml-1">{getInteractionText(activity.interaction_type)}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {activity.interaction_type !== 'profile_view' ? (
                          <p className="text-sm text-muted-foreground truncate">
                            {activity.post_title}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Viewed your profile
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                      
                      {activity.interaction_type !== 'profile_view' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPost(activity.post_id, activity.post_type)}
                          className="ml-2 flex-shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < activities.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};