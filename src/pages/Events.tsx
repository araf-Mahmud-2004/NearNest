import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  Search,
  Grid3X3,
  List,
  Calendar,
  Loader2,
} from "lucide-react";
import { usePosts } from "@/contexts/PostsContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const { events, loading, deleteEvent } = usePosts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = [
    "all",
    "Community Service",
    "Market",
    "Education",
    "Social",
    "Workshop",
    "Fitness",
  ];
  const timeFilters = ["all", "today", "tomorrow", "this-week", "next-week"];

  const handleEdit = (id: string) => {
    navigate(`/edit-event/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id);
    }
  };

  // Filter events with error handling
  const filteredEvents = events.filter((event) => {
    try {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || event.category === selectedCategory;

      let matchesTime = true;
      if (selectedTime !== "all") {
        const eventDate = event.date?.toLowerCase() || '';
        switch (selectedTime) {
          case "today":
            matchesTime = eventDate.includes("today");
            break;
          case "tomorrow":
            matchesTime = eventDate.includes("tomorrow");
            break;
          case "this-week":
            matchesTime =
              eventDate.includes("today") ||
              eventDate.includes("tomorrow") ||
              eventDate.includes("monday") ||
              eventDate.includes("tuesday") ||
              eventDate.includes("wednesday") ||
              eventDate.includes("thursday") ||
              eventDate.includes("friday") ||
              eventDate.includes("saturday") ||
              eventDate.includes("sunday");
            break;
          default:
            matchesTime = true;
        }
      }

      return matchesSearch && matchesCategory && matchesTime;
    } catch (error) {
      console.error('Error filtering event:', error);
      return false;
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Community Events
          </h1>
          <p className="text-muted-foreground">
            Discover what's happening in your neighborhood
          </p>
        </div>

        {/* Filters */}
        <div
          className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="When" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="next-week">Next Week</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1 transition-all duration-200"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1 transition-all duration-200"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div
          className="mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="text-muted-foreground">
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading events...</span>
          </div>
        )}

        {/* Events Grid/List */}
        {!loading && (
          <div
            className={`animate-fade-in transition-all duration-300 ${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            {filteredEvents.map((event, index) => (
              <ErrorBoundary 
                key={event.id}
                fallback={
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Unable to load this event</p>
                  </div>
                }
              >
                <PostCard
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  location={event.location}
                  category={event.category}
                  image={event.image}
                  date={event.date}
                  time={event.time}
                  created_at={event.created_at}
                  user_id={event.user_id}
                  profiles={event.profiles}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  type="event"
                />
              </ErrorBoundary>
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && !loading && (
          <div
            className="text-center py-12 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-muted-foreground mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No events found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;