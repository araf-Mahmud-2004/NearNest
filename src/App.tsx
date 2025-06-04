import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { PostsProvider } from "./contexts/PostsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, lazy, Suspense } from "react";

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Listings = lazy(() => import("./pages/Listings"));
const Events = lazy(() => import("./pages/Events"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EditListing = lazy(() => import("./pages/EditListing"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Messages = lazy(() => import("@/pages/Messages"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Detect email confirmation and force sign out
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type === "signup" || type === "email_confirm") {
      // Sign out and redirect to login
      supabase.auth.signOut().then(() => {
        navigate("/auth", { replace: true });
      });
    }
  }, [location, navigate]);

  // Show loading state while auth is being determined
  if (loading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Landing />}
        />
        <Route
          path="/auth"
          element={!user ? <Auth /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/auth" />}
        />
        <Route
          path="/listings"
          element={user ? <Listings /> : <Navigate to="/auth" />}
        />
        <Route
          path="/events"
          element={user ? <Events /> : <Navigate to="/auth" />}
        />
        <Route
          path="/create-listing"
          element={user ? <CreateListing /> : <Navigate to="/auth" />}
        />
        <Route
          path="/create-event"
          element={user ? <CreateEvent /> : <Navigate to="/auth" />}
        />
        <Route
          path="/edit-listing/:id"
          element={user ? <EditListing /> : <Navigate to="/auth" />}
        />
        <Route
          path="/edit-event/:id"
          element={user ? <EditEvent /> : <Navigate to="/auth" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/auth" />}
        />
        <Route
          path="/profile/:userId"
          element={user ? <Profile /> : <Navigate to="/auth" />}
        />
        <Route
          path="/settings"
          element={user ? <Settings /> : <Navigate to="/auth" />}
        />
        <Route
          path="/messages"
          element={user ? <Messages /> : <Navigate to="/auth" />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PostsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </TooltipProvider>
        </PostsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;