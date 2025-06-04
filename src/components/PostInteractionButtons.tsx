import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { trackingService } from '@/services/trackingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PostInteractionButtonsProps {
  postId: string;
  postType: 'listing' | 'event';
  postTitle: string;
  postOwnerId: string;
  className?: string;
}

export const PostInteractionButtons: React.FC<PostInteractionButtonsProps> = ({
  postId,
  postType,
  postTitle,
  postOwnerId,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInterested, setIsInterested] = useState(false);
  const [hasContacted, setHasContacted] = useState(false);

  const handleInterest = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to show interest",
        variant: "destructive",
      });
      return;
    }

    if (user.id === postOwnerId) {
      toast({
        title: "Cannot interact",
        description: "You cannot show interest in your own post",
        variant: "destructive",
      });
      return;
    }

    try {
      await trackingService.trackInterest(postId, postType, postOwnerId, postTitle);
      setIsInterested(true);
      toast({
        title: "Interest shown!",
        description: `You showed interest in "${postTitle}". The owner will be notified.`,
      });
    } catch (error) {
      console.error('Error tracking interest:', error);
      toast({
        title: "Error",
        description: "Failed to show interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContact = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to contact the owner",
        variant: "destructive",
      });
      return;
    }

    if (user.id === postOwnerId) {
      toast({
        title: "Cannot contact",
        description: "You cannot contact yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      await trackingService.trackContact(postId, postType, postOwnerId, 'message', postTitle);
      setHasContacted(true);
      toast({
        title: "Contact request sent!",
        description: `The owner of "${postTitle}" has been notified of your interest to contact them.`,
      });
    } catch (error) {
      console.error('Error tracking contact:', error);
      toast({
        title: "Error",
        description: "Failed to send contact request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = async () => {
    if (!user || user.id === postOwnerId) return;

    try {
      await trackingService.trackView(postId, postType, postOwnerId);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Track view when component mounts
  React.useEffect(() => {
    handleView();
  }, []);

  // Don't show buttons for own posts
  if (user?.id === postOwnerId) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={isInterested ? "default" : "outline"}
        size="sm"
        onClick={handleInterest}
        disabled={isInterested}
        className="flex items-center gap-1"
      >
        <Heart className={`h-4 w-4 ${isInterested ? 'fill-current' : ''}`} />
        {isInterested ? 'Interested' : 'Show Interest'}
      </Button>

      <Button
        variant={hasContacted ? "default" : "outline"}
        size="sm"
        onClick={handleContact}
        disabled={hasContacted}
        className="flex items-center gap-1"
      >
        <MessageCircle className="h-4 w-4" />
        {hasContacted ? 'Contacted' : 'Contact Owner'}
      </Button>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Eye className="h-3 w-3" />
        <span>Viewing</span>
      </div>
    </div>
  );
};