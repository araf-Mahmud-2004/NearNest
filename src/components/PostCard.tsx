import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterestButton } from "@/components/InterestButton";
import { MessageDialog } from "@/components/MessageDialog";
import { ProfileViewDialog } from "@/components/ProfileViewDialog";
import { MapPin, Clock, User, Edit, Trash2, Eye, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatRelativeTime } from "@/lib/timeUtils";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  image?: string | null;
  price?: number;
  date?: string;
  time?: string;
  timeAgo?: string;
  created_at?: string;
  user_id: string;
  profiles?: {
    id?: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
    bio?: string | null;
    created_at?: string;
    email?: string | null;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  type: "listing" | "event";
  showActions?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  description,
  location,
  category,
  image,
  price,
  date,
  time,
  timeAgo,
  created_at,
  user_id,
  profiles,
  onEdit,
  onDelete,
  type,
  showActions = true,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const isOwner = user?.id === user_id;

  const displayName = profiles?.full_name || profiles?.username || "Anonymous";
  const avatarUrl = profiles?.avatar_url;

  const handleViewProfile = () => {
    setShowProfileDialog(true);
  };

  const handleContact = () => {
    setShowMessageDialog(true);
  };

  const handleContactFromProfile = () => {
    setShowProfileDialog(false);
    setShowMessageDialog(true);
  };

  const getTimeDisplay = () => {
    if (timeAgo) return timeAgo;
    if (created_at) return formatRelativeTime(created_at);
    if (date && time) return `${date} at ${time}`;
    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant={type === "listing" ? "default" : "secondary"}>
            {category}
          </Badge>
          {price && (
            <span className="text-lg font-bold text-primary">
              ${price.toFixed(2)}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {description}
        </p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          
          {getTimeDisplay() && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{getTimeDisplay()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 space-y-2">
            {/* Primary Action Row */}
            <div className="flex gap-2">
              <InterestButton
                postId={id}
                postType={type}
                postOwnerId={user_id}
                postTitle={title}
                variant="default"
                className="flex-1"
              />
              
              {!isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContact}
                  className="flex items-center gap-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact
                </Button>
              )}
            </div>
            
            {/* Secondary Action Row */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewProfile}
                className="flex-1 flex items-center justify-center gap-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Profile
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleViewProfile}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              @{profiles?.username || "anonymous"}
            </p>
          </div>
        </div>

        {isOwner && (onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(id)}
                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(id)}
                className="text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>

      {/* Message Dialog */}
      <MessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        recipientId={user_id}
        recipientName={displayName}
        recipientAvatar={avatarUrl}
        postId={id}
        postType={type}
        postTitle={title}
      />

      {/* Profile View Dialog */}
      <ProfileViewDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        profile={{
          id: profiles?.id || user_id,
          username: profiles?.username || null,
          full_name: profiles?.full_name || null,
          avatar_url: profiles?.avatar_url || null,
          bio: profiles?.bio || null,
          created_at: profiles?.created_at,
          email: profiles?.email || null,
        }}
        postInfo={{
          id,
          title,
          type,
          category,
          location,
          created_at,
        }}
        onContact={!isOwner ? handleContactFromProfile : undefined}
      />
    </Card>
  );
};