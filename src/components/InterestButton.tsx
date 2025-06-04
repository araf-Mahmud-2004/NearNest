import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Loader2, Users } from "lucide-react";
import { useInterest } from "@/hooks/useInterest";
import { useAuth } from "@/contexts/AuthContext";
import { InterestedPersonsList } from "@/components/InterestedPersonsList";

interface InterestButtonProps {
  postId: string;
  postType: "event" | "listing";
  postOwnerId: string;
  postTitle: string;
  variant?: "default" | "compact";
  className?: string;
}

export const InterestButton: React.FC<InterestButtonProps> = ({
  postId,
  postType,
  postOwnerId,
  postTitle,
  variant = "default",
  className = "",
}) => {
  const { user } = useAuth();
  const { isInterested, interestCount, loading, toggleInterest } = useInterest(
    postId,
    postType,
    postOwnerId,
    postTitle
  );

  // Don't show interest button to the post owner
  const isOwner = user?.id === postOwnerId;

  if (isOwner) {
    // Show interest count and list for owners
    return interestCount > 0 ? (
      <InterestedPersonsList
        postId={postId}
        postType={postType}
        postTitle={postTitle}
        interestCount={interestCount}
      >
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
        >
          <Users className="h-4 w-4" />
          <span>{interestCount} interested</span>
        </Button>
      </InterestedPersonsList>
    ) : (
      <div className={`flex items-center gap-2 ${className}`}>
        <Heart className="h-4 w-4 text-muted-foreground" />
        <Badge variant="secondary" className="text-xs">
          No interest yet
        </Badge>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        variant={isInterested ? "default" : "outline"}
        size="sm"
        onClick={toggleInterest}
        disabled={loading}
        className={`flex items-center gap-1 ${className}`}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Heart 
            className={`h-3 w-3 ${isInterested ? "fill-current" : ""}`} 
          />
        )}
        {interestCount > 0 && (
          <span className="text-xs">{interestCount}</span>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isInterested ? "default" : "outline"}
      size="sm"
      onClick={toggleInterest}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart 
          className={`h-4 w-4 ${isInterested ? "fill-current" : ""}`} 
        />
      )}
      <span>
        {isInterested ? "Interested" : "Interested?"}
      </span>
      {interestCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {interestCount}
        </Badge>
      )}
    </Button>
  );
};