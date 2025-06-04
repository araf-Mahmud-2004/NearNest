import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MapPin, 
  Calendar, 
  Mail, 
  MessageCircle, 
  Star,
  Clock,
  Package,
  Users
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/timeUtils';

interface ProfileViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at?: string;
    email?: string | null;
  };
  postInfo?: {
    id: string;
    title: string;
    type: 'listing' | 'event';
    category: string;
    location: string;
    created_at?: string;
  };
  onContact?: () => void;
}

export const ProfileViewDialog: React.FC<ProfileViewDialogProps> = ({
  open,
  onOpenChange,
  profile,
  postInfo,
  onContact,
}) => {
  const displayName = profile.full_name || profile.username || 'Anonymous User';
  const joinedDate = profile.created_at ? formatRelativeTime(profile.created_at) : 'Recently';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View information about this community member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{displayName}</h3>
              {profile.username && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Joined {joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div>
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Post Context */}
          {postInfo && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {postInfo.type === 'listing' ? (
                    <Package className="h-4 w-4" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  {postInfo.type === 'listing' ? 'Listing Details' : 'Event Details'}
                </h4>
                
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{postInfo.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {postInfo.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{postInfo.location}</span>
                      </div>
                      {postInfo.created_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeTime(postInfo.created_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Contact Section */}
          <div className="flex gap-3">
            {onContact && (
              <Button onClick={onContact} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {/* Community Stats (Mock for now) */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">12</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">4.8</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">89%</div>
              <div className="text-xs text-muted-foreground">Response</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};