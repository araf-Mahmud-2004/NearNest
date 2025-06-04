import { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Moon, Sun, Monitor, Palette } from "lucide-react";

const Settings = () => {
  const { user, changePassword, signOut } = useContext(AuthContext) || {};
  const { theme, setTheme, actualTheme } = useTheme();

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Notification Preferences State
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  // Delete Account Dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    setLoadingPassword(true);
    try {
      if (changePassword) {
        await changePassword(currentPassword, newPassword);
        setPasswordSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError("Password change function not available.");
      }
    } catch (err: any) {
      console.error("Password change error:", err);
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setLoadingPassword(false);
    }
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      if (!user?.id) {
        throw new Error("User not found. Please log in again.");
      }

      console.log("Attempting to delete account for user:", user.id);

      // First, check if the backend server is running
      let healthCheck;
      try {
        healthCheck = await fetch("http://localhost:4000/health", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (networkError) {
        throw new Error(
          "Cannot connect to deletion service. Please make sure the backend server is running on port 4000."
        );
      }

      if (!healthCheck.ok) {
        throw new Error(
          "Deletion service is not responding properly. Please try again later."
        );
      }

      // Now attempt the actual deletion
      const response = await fetch("http://localhost:4000/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account.");
      }

      const result = await response.json();
      console.log("Account deletion successful:", result);

      // Verify the deletion was successful
      if (!result.success) {
        throw new Error("Account deletion was not completed successfully.");
      }

      // Sign out the user after successful deletion
      if (signOut) {
        await signOut();
      }

      setDeleteError("");
      setShowDeleteDialog(false);
      alert(
        "Your account has been deleted successfully. Thank you for using NearNest."
      );

      // Clear any local storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth";
    } catch (err: any) {
      console.error("Delete account error:", err);
      setDeleteError(
        err.message || "Failed to delete account. Please try again later."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light mode' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark mode' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preference' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Theme Settings Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Theme Display */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {actualTheme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <div>
                  <p className="font-medium">
                    Currently using {actualTheme} mode
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'system' ? 'Following system preference' : `Manually set to ${theme}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Choose Theme</Label>
              <div className="grid grid-cols-1 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        theme === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setTheme(option.value as any)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        theme === option.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">Quick Toggle</p>
                <p className="text-sm text-muted-foreground">
                  Use the dropdown for more options
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                  required
                  minLength={6}
                />
              </div>
              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="text-green-600 text-sm">{passwordSuccess}</div>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loadingPassword}
              >
                {loadingPassword ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif">Email Notifications</Label>
                <Switch
                  id="email-notif"
                  checked={emailNotif}
                  onCheckedChange={setEmailNotif}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notif">Push Notifications</Label>
                <Switch
                  id="push-notif"
                  checked={pushNotif}
                  onCheckedChange={setPushNotif}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              This action is irreversible. All your data will be permanently
              deleted.
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone. All your data, including listings and profile
              information, will be permanently removed.
            </DialogDescription>
            {deleteError && (
              <div className="text-red-500 text-sm mb-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <strong>Error:</strong> {deleteError}
                {deleteError.includes("backend server") && (
                  <div className="mt-2 text-xs">
                    <strong>To fix this:</strong>
                    <br />
                    1. Open a terminal in your project folder
                    <br />
                    2. Run: <code>node backend/deleteUser.cjs</code>
                    <br />
                    3. Keep the terminal open and try again
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Settings;