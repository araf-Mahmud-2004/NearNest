import { useState, useEffect } from "react";
import { interestService } from "@/services/interestService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useInterest = (
  postId: string,
  postType: "event" | "listing",
  postOwnerId: string,
  postTitle: string
) => {
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is interested and get count
  useEffect(() => {
    const loadInterestData = async () => {
      if (!user) return;

      try {
        // Check if user is interested
        const { data: interest } = await interestService.checkInterest(
          user.id,
          postId,
          postType
        );
        setIsInterested(!!interest);

        // Get interest count
        const { count } = await interestService.getInterestCount(postId, postType);
        setInterestCount(count || 0);
      } catch (error) {
        console.error("Error loading interest data:", error);
      }
    };

    loadInterestData();
  }, [user, postId, postType]);

  const toggleInterest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to show interest",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userName = user.user_metadata?.full_name || user.email || "Someone";
      
      const { isInterested: newInterestState, error } = await interestService.toggleInterest(
        user.id,
        postId,
        postType,
        postOwnerId,
        postTitle,
        userName
      );

      if (error) {
        throw error;
      }

      setIsInterested(newInterestState);
      setInterestCount(prev => newInterestState ? prev + 1 : prev - 1);

      toast({
        title: newInterestState ? "Interest Added" : "Interest Removed",
        description: newInterestState 
          ? `You've shown interest in "${postTitle}"`
          : `You've removed interest from "${postTitle}"`,
      });
    } catch (error) {
      console.error("Error toggling interest:", error);
      toast({
        title: "Error",
        description: "Failed to update interest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isInterested,
    interestCount,
    loading,
    toggleInterest,
  };
};