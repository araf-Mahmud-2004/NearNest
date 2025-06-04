import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Bell,
  User,
  Plus,
  Menu,
  List,
  Calendar,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RealTimeNotifications } from "@/components/RealTimeNotifications";
import { MessagesIcon } from "@/components/MessagesIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, username, profile, signOut, profileLoading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const handlePostListing = () => {
    navigate("/create-listing");
  };

  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            <span className="text-xl font-bold text-foreground">NearNest</span>
          </Link>

          {/* Desktop Search - Only show if user is authenticated */}
          {user && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for items, events, or services..."
                  className="pl-10 pr-4 py-2 w-full bg-card text-card-foreground"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                                <Link to="/listings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <List className="h-4 w-4 mr-2" />
                    Listings
                  </Button>
                </Link>
                <Link to="/events">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <Button
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    onClick={handlePostListing}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={handleCreateEvent}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Event
                  </Button>
                </div>
                
                {/* Notifications and Messages */}
                <div className="flex items-center space-x-2">
                  <MessagesIcon />
                  <RealTimeNotifications />
                </div>

                {/* User Menu - Updated to show username */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <User className="h-5 w-5" />
                      <span className="hidden lg:inline">
                        {profileLoading
                          ? "Loading..."
                          : username ||
                            profile?.full_name ||
                            user.email?.split("@")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-card text-card-foreground"
                  >
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/messages")}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/settings">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-foreground"
                        >
                          Settings
                        </Button>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-foreground">
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-accent text-primary-foreground">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search - Only show if user is authenticated */}
        {user && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-full bg-card text-card-foreground"
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 border-t border-border pt-3">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                                    <Link to="/listings">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-primary"
                    >
                      <List className="h-4 w-4 mr-2" />
                      Listings
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-primary"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Events
                    </Button>
                  </Link>
                  <Link to="/messages">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-primary"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                  <Button 
                    className="bg-primary hover:bg-accent text-primary-foreground justify-start"
                    onClick={handlePostListing}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post Listing
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground justify-start"
                    onClick={handleCreateEvent}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-primary"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-foreground"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-primary hover:bg-accent text-primary-foreground justify-start">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;