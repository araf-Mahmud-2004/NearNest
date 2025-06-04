import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MessageCircle, Heart, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trackingService } from '@/services/trackingService';

interface ActivityStatsProps {
  userId?: string;
}

interface Stats {
  total_views: number;
  total_contacts: number;
  total_interests: number;
  recent_viewers: number;
}

export const ActivityStats: React.FC<ActivityStatsProps> = ({ userId }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    total_views: 0,
    total_contacts: 0,
    total_interests: 0,
    recent_viewers: 0
  });
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  // Fetch stats from the database
  const fetchStats = useCallback(async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      const { data, error } = await trackingService.getActivityStats(targetUserId);
      
      if (error) {
        console.error('Error fetching activity stats:', error);
        // Set default stats on error
        setStats({
          total_views: 0,
          total_contacts: 0,
          total_interests: 0,
          recent_viewers: 0
        });
      } else {
        setStats(data || {
          total_views: 0,
          total_contacts: 0,
          total_interests: 0,
          recent_viewers: 0
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching activity stats:', err);
      setStats({
        total_views: 0,
        total_contacts: 0,
        total_interests: 0,
        recent_viewers: 0
      });
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up real-time updates
  useEffect(() => {
    if (!targetUserId) return;

    // Subscribe to interactions to update stats in real-time
    const subscription = trackingService.subscribeToInteractions(targetUserId, (payload) => {
      console.log('Stats update from real-time interaction:', payload);
      // Refresh stats when new interactions occur
      fetchStats();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [targetUserId, fetchStats]);

  const statCards = [
    {
      title: 'Total Views',
      value: stats.total_views,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Contacts',
      value: stats.total_contacts,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Interests',
      value: stats.total_interests,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950'
    },
    {
      title: 'Recent Viewers',
      value: stats.recent_viewers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};