import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, MessageCircle, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { interestService } from "@/services/interestService";
import { InterestedPersonProfile } from "@/components/InterestedPersonProfile";

interface InterestedPersonsListProps {
  postId: string;
  postType: "event" | "listing";
  postTitle: string;
  interestCount: number;
  children: React.ReactNode; // Trigger element
}

export const InterestedPersonsList: React.FC<InterestedPersonsListProps> = ({
  postId,
  postType,
  postTitle,
  interestCount,
  children,
}) => {
  const [interestedPersons, setInterestedPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadInterestedPersons = async () => {
    setLoading(true);
    try {
      const { data, error } = await interestService.getPostInterests(postId, postType);
      if (data) {
        setInterestedPersons(data);
      }
    } catch (error) {
      console.error("Error loading interested persons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadInterestedPersons();
    }
  }, [open, postId, postType]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const interestTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - interestTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Interested Persons ({interestCount})
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            People who showed interest in "{postTitle}"
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : interestedPersons.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No one has shown interest yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {interestedPersons.map((interest) => {
              const profile = interest.profiles;
              if (!profile) return null;

              return (
                <Card key={interest.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {profile.full_name || profile.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{profile.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Interested {formatTimeAgo(interest.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <InterestedPersonProfile
                          profile={profile}
                          postTitle={postTitle}
                          postType={postType}
                        >
                          <Button variant="outline" size="sm">
                            <User className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </InterestedPersonProfile>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            // Contact functionality
                            alert(`Contact feature coming soon! You can reach out to ${profile.full_name || profile.username}.`);
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {interestedPersons.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💡 Tip: You can contact interested persons to coordinate details about your {postType}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};