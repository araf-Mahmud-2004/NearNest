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
  Loader2,
} from "lucide-react";
import { usePosts } from "@/contexts/PostsContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Listings = () => {
  const { listings, loading, deleteListing } = usePosts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = [
    "all",
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Sports",
    "Other",
  ];

  const handleEdit = (id: string) => {
    navigate(`/edit-listing/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deleteListing(id);
    }
  };

  // Filter and sort listings with error handling
  const filteredListings = listings
    .filter((listing) => {
      try {
        const matchesSearch =
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || listing.category === selectedCategory;
        return matchesSearch && matchesCategory;
      } catch (error) {
        console.error('Error filtering listing:', error);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        switch (sortBy) {
          case "price-low":
            return (a.price || 0) - (b.price || 0);
          case "price-high":
            return (b.price || 0) - (a.price || 0);
          case "newest":
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          case "oldest":
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          default:
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
      } catch (error) {
        console.error('Error sorting listings:', error);
        return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            Discover great deals from your neighbors
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
                placeholder="Search listings..."
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
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
            {filteredListings.length} listing
            {filteredListings.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading listings...</span>
          </div>
        )}

        {/* Listings Grid/List */}
        {!loading && (
          <div
            className={`animate-fade-in transition-all duration-300 ${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            {filteredListings.map((listing, index) => (
              <ErrorBoundary 
                key={listing.id}
                fallback={
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Unable to load this listing</p>
                  </div>
                }
              >
                <PostCard
                  id={listing.id}
                  title={listing.title}
                  description={listing.description}
                  location={listing.location}
                  category={listing.category}
                  image={listing.image}
                  price={listing.price}
                  timeAgo={listing.timeAgo}
                  created_at={listing.created_at}
                  user_id={listing.user_id}
                  profiles={listing.profiles}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  type="listing"
                />
              </ErrorBoundary>
            ))}
          </div>
        )}

        {filteredListings.length === 0 && !loading && (
          <div
            className="text-center py-12 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No listings found
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

export default Listings;