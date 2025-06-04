import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, Search, Calendar, List, User, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Use the existing Navbar component */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative gradient-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-primary leading-tight">
                  The Local Network That's Got Your Back
                </h1>
                <p className="text-xl text-primary/70 leading-relaxed">
                  Connect with your neighbors, discover local events, and trade
                  goods safely. NearNest brings communities together, one
                  connection at a time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-accent text-primary-foreground px-8 py-3 text-lg"
                  >
                    Join the Network
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg"
                  onClick={() => navigate("/dashboard")}
                >
                  Explore Community
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-primary/60">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Free to Join</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Safe & Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Local Focus</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Floating Elements */}
              <div className="bg-card rounded-2xl p-6 shadow-lg animate-float">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Find Anything
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Search local listings and events
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="bg-card rounded-2xl p-6 shadow-lg animate-float ml-8"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Join Events
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Discover local happenings
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="bg-card rounded-2xl p-6 shadow-lg animate-float"
                style={{ animationDelay: "2s" }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Build Trust
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Verified community members
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Circles */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full"></div>
              <div className="absolute bottom-20 left-5 w-24 h-24 bg-primary/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <ArrowDown className="h-6 w-6 text-primary/60" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Get Connected. Build Community. Stay Local.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              NearNest makes it easy to connect with your neighbors, discover
              local opportunities, and build the community you want to live in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <List className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Buy & Sell Locally
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Find great deals on items from your neighbors. Post what
                  you're selling and connect with buyers nearby.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Discover Events
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Never miss out on local events. From community gatherings to
                  skill shares, find what's happening near you.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Build Trust
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with verified community members. Share reviews and
                  build lasting relationships with your neighbors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-primary mb-6">
            Ready to Connect with Your Community?
          </h2>
          <p className="text-xl text-primary/70 mb-8">
            Join thousands of neighbors who are already building stronger
            communities on NearNest.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground px-12 py-4 text-lg"
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">N</span>
                </div>
                <span className="text-xl font-bold">NearNest</span>
              </div>
              <p className="text-primary-foreground/80">
                Building stronger communities, one connection at a time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <div className="space-y-2 text-primary-foreground/80">
                <div>Browse Listings</div>
                <div>Upcoming Events</div>
                <div>Local Deals</div>
                <div>Safety Guidelines</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-primary-foreground/80">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Community Guidelines</div>
                <div>Report Content</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-primary-foreground/80">
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Cookie Policy</div>
                <div>About</div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/20 mt-12 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 NearNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
