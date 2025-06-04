import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileService } from "@/services/profileService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    email: user?.email || "",
    bio: profile?.bio || "",
    avatar_url: profile?.avatar_url || "",
    location: profile?.location || "",
    twitter: profile?.twitter || "",
    linkedin: profile?.linkedin || "",
    facebook: profile?.facebook || "",
    website: profile?.website || "",
  });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(form.avatar_url);

  // Update form and avatar preview when profile loads
  useEffect(() => {
    setForm({
      full_name: profile?.full_name || "",
      email: user?.email || "",
      bio: profile?.bio || "",
      avatar_url: profile?.avatar_url || "",
      location: profile?.location || "",
      twitter: profile?.twitter || "",
      linkedin: profile?.linkedin || "",
      facebook: profile?.facebook || "",
      website: profile?.website || "",
    });
    setAvatarPreview(profile?.avatar_url || "");
  }, [profile, user]);

  if (!user) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setLoading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `avatar/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Avatar Upload Failed",
        description: uploadError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from("avatar").getPublicUrl(filePath);
    if (data?.publicUrl) {
      setForm((prev) => ({ ...prev, avatar_url: data.publicUrl }));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await profileService.updateProfile(user.id, {
      full_name: form.full_name,
      bio: form.bio,
      avatar_url: form.avatar_url,
      location: form.location,
      twitter: form.twitter,
      linkedin: form.linkedin,
      facebook: form.facebook,
      website: form.website,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your profile was updated successfully.",
      });
      refreshProfile && refreshProfile();
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-card text-card-foreground rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center">
            <img
              src={avatarPreview || "/default-avatar.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow"
            />
            <Button
              type="button"
              size="sm"
              className="mt-2 bg-primary text-primary-foreground rounded-full px-4 py-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {avatarPreview ? "Change" : "Upload"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={loading}
            />
          </div>
          <div className="mb-14">
            <div className="font-semibold text-foreground">
              {profile?.username}
            </div>
            <div className="text-sm text-muted-foreground">{form.email}</div>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium text-foreground">
            Full Name
          </label>
          <Input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-foreground">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-background text-foreground border-border"
            rows={3}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-foreground">
            Location
          </label>
          <Input
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-foreground">
            Twitter
          </label>
          <Input
            name="twitter"
            value={form.twitter}
            onChange={handleChange}
            placeholder="https://twitter.com/yourhandle"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-foreground">
            LinkedIn
          </label>
          <Input
            name="linkedin"
            value={form.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-foreground">
            Facebook
          </label>
          <Input
            name="facebook"
            value={form.facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/yourprofile"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-foreground">
            Website
          </label>
          <Input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
          />
        </div>
        <Button
          type="submit"
          className="bg-primary text-primary-foreground"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
};

export default Profile;
