import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MessageCircle, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InterestedPersonProfileProps {
  profile: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio?: string | null;
    location?: string | null;
  };
  postTitle: string;
  postType: "event" | "listing";
  children: React.ReactNode; // Trigger element
}

export const InterestedPersonProfile: React.FC<InterestedPersonProfileProps> = ({
  profile,
  postTitle,
  postType,
  children,
}) => {
  const displayName = profile.full_name || profile.username;
  const username = profile.username;

  const handleContactUser = () => {
    // In a real app, this could open a messaging system
    // For now, we'll just show an alert
    alert(`Contact feature coming soon! You can reach out to ${displayName} about your ${postType}.`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Interested Person</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Avatar */}
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">{displayName}</h3>
                <p className="text-sm text-muted-foreground">@{username}</p>
                
                {profile.bio && (
                  <p className="text-sm text-center max-w-xs">{profile.bio}</p>
                )}
                
                {profile.location && (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Interest Context */}
              <div className="text-center p-3 bg-muted rounded-lg w-full">
                <p className="text-sm text-muted-foreground">
                  Interested in your {postType}:
                </p>
                <p className="font-medium text-sm mt-1">"{postTitle}"</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full">
                <Button
                  onClick={handleContactUser}
                  className="flex-1 flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Navigate to user's profile page
                    window.location.href = `/profile/${profile.id}`;
                  }}
                  className="flex-1 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  Community Member
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};