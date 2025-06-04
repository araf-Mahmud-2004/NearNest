import { supabase } from "@/integrations/supabase/client";
import { InterestInsert, NotificationInsert } from "@/types/supabase";

export const interestService = {
  // Check if user has already shown interest in a post
  async checkInterest(userId: string, postId: string, postType: "event" | "listing") {
    const { data, error } = await supabase
      .from("interests")
      .select("*")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .eq("post_type", postType)
      .single();

    return { data, error };
  },

  // Add interest to a post
  async addInterest(interest: InterestInsert) {
    const { data, error } = await supabase
      .from("interests")
      .insert(interest)
      .select()
      .single();

    return { data, error };
  },

  // Remove interest from a post
  async removeInterest(userId: string, postId: string, postType: "event" | "listing") {
    const { error } = await supabase
      .from("interests")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId)
      .eq("post_type", postType);

    return { error };
  },

  // Get all interests for a post
  async getPostInterests(postId: string, postType: "event" | "listing") {
    const { data, error } = await supabase
      .from("interests")
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .eq("post_type", postType)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get interest count for a post
  async getInterestCount(postId: string, postType: "event" | "listing") {
    const { count, error } = await supabase
      .from("interests")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("post_type", postType);

    return { count, error };
  },

  // Create notification for post owner
  async createInterestNotification(
    postOwnerId: string,
    interestedUserId: string,
    postId: string,
    postType: "event" | "listing",
    postTitle: string,
    interestedUserName: string
  ) {
    const notification: NotificationInsert = {
      user_id: postOwnerId,
      type: "interest",
      title: `Someone is interested in your ${postType}`,
      message: `${interestedUserName} is interested in "${postTitle}"`,
      data: {
        post_id: postId,
        post_type: postType,
        post_title: postTitle,
        interested_user_id: interestedUserId,
        interested_user_name: interestedUserName,
      },
      read: false,
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    return { data, error };
  },

  // Toggle interest (add if not exists, remove if exists)
  async toggleInterest(
    userId: string,
    postId: string,
    postType: "event" | "listing",
    postOwnerId: string,
    postTitle: string,
    userName: string
  ) {
    // Check if interest already exists
    const { data: existingInterest } = await this.checkInterest(userId, postId, postType);

    if (existingInterest) {
      // Remove interest
      const { error } = await this.removeInterest(userId, postId, postType);
      return { isInterested: false, error };
    } else {
      // Add interest
      const { data: newInterest, error: interestError } = await this.addInterest({
        user_id: userId,
        post_id: postId,
        post_type: postType,
      });

      if (interestError) {
        return { isInterested: false, error: interestError };
      }

      // Create notification for post owner (only if not the same user)
      if (userId !== postOwnerId) {
        await this.createInterestNotification(
          postOwnerId,
          userId,
          postId,
          postType,
          postTitle,
          userName
        );
      }

      return { isInterested: true, error: null };
    }
  },
};