import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Calendar,
  List,
  MapPin,
  Bell,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityStats } from "@/components/ActivityStats";
import { RecentActivity } from "@/components/RecentActivity";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRealTimeUpdates } from "@/hooks/useWebSocket";
import { postsService, ListingWithProfile, EventWithProfile } from "@/services/postsService";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/contexts/PostsContext";
import { RealTimeNotifications } from "@/components/RealTimeNotifications";

const Dashboard = () => {
  const { user, username, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackListings, trackEvents } = useRealTimeUpdates();
  const { listings: allListings, events: allEvents, loading: postsLoading, refreshData } = usePosts();

  // Real-time state management
  const [recentListings, setRecentListings] = useState<ListingWithProfile[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithProfile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Community stats state
  const [communityStats, setCommunityStats] = useState({
    activeListings: 0,
    weeklyEvents: 0,
    newMembers: 23, // This could be fetched from a separate API
  });

  // Utility functions
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Process data from PostsContext
  const processData = useCallback(() => {
    try {
      setIsLoadingData(true);
      
      // Process listings
      if (allListings && allListings.length > 0) {
        const recentListingsData = allListings.slice(0, 5); // Get latest 5
        setRecentListings(recentListingsData);
        setCommunityStats(prev => ({ ...prev, activeListings: allListings.length }));
      } else {
        setRecentListings([]);
        setCommunityStats(prev => ({ ...prev, activeListings: 0 }));
      }

      // Process events
      if (allEvents && allEvents.length > 0) {
        // Filter for upcoming events
        const now = new Date();
        const upcomingEventsData = allEvents
          .filter(event => new Date(event.date) >= now)
          .slice(0, 5); // Get next 5 upcoming events
        setUpcomingEvents(upcomingEventsData);
        
        // Count events for this week
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weeklyEventsCount = allEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= now && eventDate <= weekEnd;
        }).length;
        setCommunityStats(prev => ({ ...prev, weeklyEvents: weeklyEventsCount }));
      } else {
        setUpcomingEvents([]);
        setCommunityStats(prev => ({ ...prev, weeklyEvents: 0 }));
      }

      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (error) {
      console.error('Error processing data:', error);
      setIsConnected(false);
    } finally {
      setIsLoadingData(false);
    }
  }, [allListings, allEvents]);

  // Data refresh function that only refreshes content, not auth
  const handleRefreshData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      await refreshData(); // Use PostsContext refresh
      toast({
        title: "Data refreshed",
        description: "Dashboard content has been updated",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh failed",
        description: "Failed to refresh dashboard data",
        variant: "destructive",
      });
    }
  }, [refreshData, toast]);

  // Simple real-time connection monitoring
  const handleRealTimeUpdate = useCallback(() => {
    setLastUpdate(new Date());
    setIsConnected(true);
  }, []);

  // Handler functions
  const handlePostListing = () => {
    navigate("/create-listing");
  };

  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  const handleBrowseItems = () => {
    navigate("/listings");
  };

  const handleLocalEvents = () => {
    navigate("/events");
  };

  const handleViewAllListings = () => {
    navigate("/listings");
  };

  const handleViewAllEvents = () => {
    navigate("/events");
  };

  
  // Effects
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Process data when PostsContext data changes
  useEffect(() => {
    if (!postsLoading) {
      processData();
    }
  }, [allListings, allEvents, postsLoading, processData]);

  // Set loading state based on PostsContext loading
  useEffect(() => {
    setIsLoadingData(postsLoading);
  }, [postsLoading]);

  // Set up real-time subscriptions for connection monitoring
  useEffect(() => {
    if (!user) return;

    const listingsUnsubscribe = trackListings(handleRealTimeUpdate);
    const eventsUnsubscribe = trackEvents(handleRealTimeUpdate);

    return () => {
      listingsUnsubscribe();
      eventsUnsubscribe();
    };
  }, [user, trackListings, trackEvents, handleRealTimeUpdate]);

  // Connection status monitoring
  useEffect(() => {
    const checkConnection = () => {
      const timeSinceLastUpdate = new Date().getTime() - lastUpdate.getTime();
      const isStale = timeSinceLastUpdate > 5 * 60 * 1000; // 5 minutes
      setIsConnected(!isStale);
    };

    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [lastUpdate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nearnest-green"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back! 👋
            </h1>
            <div className="flex items-center gap-4">
              {/* Real-time status indicator */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
              {/* Last update time */}
              <span className="text-xs text-muted-foreground">
                Updated {formatTimeAgo(lastUpdate.toISOString())}
              </span>
              {/* Refresh button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshData}
                disabled={isLoadingData}
                className="h-8 w-8 p-0"
              >
                <Activity className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          {username && (
            <p className="text-lg text-muted-foreground mb-6">
              Hello,{" "}
              <span className="font-semibold text-primary">{username}</span>!
              Ready to explore your neighborhood?
            </p>
          )}
          <p className="text-muted-foreground">
            Here's what's happening in your community today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-primary to-primary/80 hover:scale-105 animate-fade-in"
            onClick={handlePostListing}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/60 rounded-xl flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">
                    Post Listing
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    Sell something
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-slate-800 dark:to-blue-900 hover:scale-105 animate-fade-in"
            onClick={handleCreateEvent}
            style={{ animationDelay: "0.1s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 dark:bg-white/30 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Create Event</h3>
                  <p className="text-sm text-white/80 dark:text-white/90">Host something</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 animate-fade-in"
            onClick={handleBrowseItems}
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <List className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Browse Items
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find great deals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 animate-fade-in"
            onClick={handleLocalEvents}
            style={{ animationDelay: "0.3s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/80 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Local Events
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Join activities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Stats */}
        <div
          className="mb-8 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Your Activity
          </h2>
          <ErrorBoundary
            fallback={
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Activity stats temporarily unavailable
                  </p>
                </CardContent>
              </Card>
            }
          >
            <ActivityStats />
          </ErrorBoundary>
        </div>

        {/* Main Content */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          {/* Recent Listings and Activity */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="listings">Recent Listings</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-6">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold">
                        Recent Listings Near You
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80"
                        onClick={handleViewAllListings}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingData ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 rounded-lg animate-pulse">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentListings.length > 0 ? (
                      recentListings.map((listing) => (
                        <div
                          key={listing.id}
                          className="flex items-center space-x-4 p-4 rounded-lg hover:bg-accent/40 transition-colors duration-200 cursor-pointer"
                          onClick={() => navigate(`/listings`)}
                        >
                          <img
                            src={listing.image || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop"}
                            alt={listing.title}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {listing.title}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-lg font-semibold text-primary">
                                ${listing.price}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {listing.location}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(listing.created_at)}
                              </span>
                              {listing.profiles && (
                                <span className="text-xs text-muted-foreground">
                                  by {postsService.getDisplayName(listing.profiles)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No recent listings found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={handlePostListing}
                        >
                          Post the first listing
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <ErrorBoundary
                  fallback={
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">
                          Recent activity temporarily unavailable
                        </p>
                      </CardContent>
                    </Card>
                  }
                >
                  <RecentActivity showHeader={false} />
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingData ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-border hover:border-primary/40 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate("/events")}
                    >
                      <h4 className="font-medium text-foreground text-sm">
                        {event.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>
                          {formatEventDate(event.date)} at {event.time}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </span>
                      </div>
                      {event.profiles && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          by {postsService.getDisplayName(event.profiles)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">No upcoming events</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateEvent}
                    >
                      Create an event
                    </Button>
                  </div>
                )}
                {upcomingEvents.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary hover:text-primary/80"
                    onClick={handleViewAllEvents}
                  >
                    View All Events
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Community Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingData ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Listings</span>
                      <span className="font-semibold text-primary">
                        {communityStats.activeListings}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        This Week's Events
                      </span>
                      <span className="font-semibold text-purple-500">
                        {communityStats.weeklyEvents}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Members</span>
                      <span className="font-semibold text-primary/80">
                        {communityStats.newMembers}
                      </span>
                    </div>
                  </>
                )}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Live updates enabled
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {isConnected ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      ) : (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
