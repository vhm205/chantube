import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ChannelGrid } from "@/components/ChannelGrid";
import { EmptyState } from "@/components/EmptyState";
import { Channel } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { youtubeService } from "@/services/YouTubeService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Dashboard() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showKidFriendlyOnly, setShowKidFriendlyOnly] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [prevPageToken, setPrevPageToken] = useState<string | undefined>(undefined);
  const [totalResults, setTotalResults] = useState<number | undefined>(undefined);
  const CHANNELS_PER_PAGE = 50; // Number of channels to display per page from API
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check if authenticated and if the YouTube service has an access token
    if (isAuthenticated && youtubeService.hasAccessToken()) {
      fetchChannels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Fetch channels when filters change
  useEffect(() => {
    if (isAuthenticated && youtubeService.hasAccessToken()) {
      // Only apply filters if we have channels
      fetchChannels(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, searchTerm, categoryFilter, showKidFriendlyOnly]);

  const fetchChannels = async (useCache = true, pageToken?: string) => {
    setIsLoading(true);
    try {
      // Clear cache if requested
      if (!useCache) {
        youtubeService.clearCache();
        toast({
          title: "Cache Cleared",
          description: "Fetching fresh data from YouTube...",
        });
      }

      // Use the YouTube service to fetch subscriptions with pagination
      const result = await youtubeService.getSubscriptions(pageToken, CHANNELS_PER_PAGE);

      // Update state with the results
      setChannels(result.channels);
      setNextPageToken(result.nextPageToken);
      setPrevPageToken(result.prevPageToken);
      setTotalResults(result.totalResults);

      // Scroll to top when loading new page
      window.scrollTo({
        top: document.getElementById('channel-grid-container')?.offsetTop || 0,
        behavior: 'smooth'
      });
    } catch (error) {
      console.error("Error fetching channels:", error);

      // Check if the error is due to token expiration
      if (error instanceof Error && error.message.includes("token expired")) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
      }
      // Check for quota exceeded error
      else if (
        error instanceof Error &&
        error.message.includes("quota exceeded")
      ) {
        toast({
          title: "API Limit Reached",
          description:
            "YouTube API quota exceeded. Using cached data if available.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load channels. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear cache and refresh data
  const clearCacheAndRefresh = () => {
    fetchChannels(false);
  };

  // Function to handle next page
  const handleNextPage = () => {
    if (nextPageToken) {
      fetchChannels(true, nextPageToken);
    }
  };

  // Function to handle previous page
  const handlePrevPage = () => {
    if (prevPageToken) {
      fetchChannels(true, prevPageToken);
    }
  };

  const filterKidFriendlyChannels = async () => {
    setIsFiltering(true);
    try {
      // Set the filter state first - this will trigger a re-fetch with the filter applied
      setShowKidFriendlyOnly(true);

      toast({
        title: "Filtering...",
        description: "Showing only family-friendly channels",
      });
    } catch (error) {
      console.error("Error filtering channels:", error);
      toast({
        title: "Error",
        description: "Failed to filter channels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFiltering(false);
    }
  };

  const handleUnsubscribe = async (channelId: string) => {
    try {
      // Use the YouTube service to unsubscribe
      const success = await youtubeService.unsubscribeFromChannel(channelId);

      if (success) {
        // Remove the channel from the state
        setChannels((prevChannels) =>
          prevChannels.filter((channel) => channel.id !== channelId)
        );

        toast({
          title: "Unsubscribed",
          description: "You have unsubscribed from this channel.",
        });
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);

      // Check if the error is due to token expiration
      if (error instanceof Error && error.message.includes("token expired")) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
      }
      // Check for permission issues
      else if (error instanceof Error &&
              (error.message.includes("insufficient authentication scopes") ||
               error.message.includes("insufficientPermissions") ||
               error.message.includes("ACCESS_TOKEN_SCOPE_INSUFFICIENT") ||
               error.message.includes("re-login with additional permissions"))) {
        toast({
          title: "Additional Permissions Required",
          description: "Please sign out and sign in again to grant the necessary permissions for managing subscriptions.",
          variant: "destructive",
        });

        // Add a logout button to the toast
        toast({
          title: "Action Required",
          description: "Sign out now and sign back in to fix this issue.",
          action: (
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight"
            >
              Sign Out
            </Button>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to unsubscribe. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-kidtube-highlight p-8 text-center shadow-md">
          <h2 className="text-2xl font-bold text-kidtube-primary">Sign In Required</h2>
          <p className="text-kidtube-foreground">
            Please sign in with your Google account to access and manage your
            YouTube channel subscriptions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-kidtube-primary">Channel Management</h1>
          <p className="text-kidtube-secondary mt-2">
            Discover and manage eco-friendly content for a better viewing experience.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={filterKidFriendlyChannels}
            disabled={isFiltering}
            className="bg-kidtube-primary hover:bg-kidtube-primary/90"
          >
            {isFiltering ? "Analyzing Content..." : "Find Family-Friendly Content"}
          </Button>
          <Button
            onClick={() => fetchChannels(true)}
            variant="outline"
            disabled={isLoading}
            className="border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight"
          >
            {isLoading ? "Refreshing..." : "Update Channels"}
          </Button>
          <Button
            onClick={clearCacheAndRefresh}
            variant="outline"
            disabled={isLoading}
            className="border-kidtube-light text-kidtube-secondary hover:bg-kidtube-highlight"
          >
            Clear Cache
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 bg-kidtube-highlight p-4 rounded-lg shadow-sm">
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="search-channels" className="text-sm font-medium text-kidtube-foreground mb-2 block">Search Channels</label>
          <Input
            id="search-channels"
            placeholder="Enter channel name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-kidtube-light focus:border-kidtube-primary"
          />
        </div>
        <div className="flex flex-col space-y-4">
          <div>
            <label htmlFor="category-filter" className="text-sm font-medium text-kidtube-foreground mb-2 block">Content Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter" className="w-full border-kidtube-light">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Education">Educational</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Gaming">Gaming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant={showKidFriendlyOnly ? "default" : "outline"}
            onClick={() => setShowKidFriendlyOnly(!showKidFriendlyOnly)}
            className={
              showKidFriendlyOnly
                ? "bg-kidtube-primary text-white hover:bg-kidtube-primary/90"
                : "border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight"
            }
          >
            {showKidFriendlyOnly ? "✓ Family-Friendly Only" : "Show All Content"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] w-full items-center justify-center bg-white rounded-lg shadow-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-kidtube-primary"></div>
            <p className="text-kidtube-secondary font-medium">Retrieving your channels...</p>
            <p className="text-sm text-muted-foreground max-w-md text-center">We're connecting to YouTube to fetch your latest channel subscriptions.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div>
              <p className="text-kidtube-foreground font-medium">
                {channels.length}{" "}
                {channels.length === 1 ? "channel" : "channels"} displayed
              </p>
              <p className="text-sm text-muted-foreground">
                {showKidFriendlyOnly ? "Showing family-friendly content only" : "Showing all content"}
                {totalResults && totalResults > CHANNELS_PER_PAGE && (
                  <span className="ml-1">
                    • Page {prevPageToken ? "2+" : "1"} of results (total: {totalResults})
                  </span>
                )}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-kidtube-light text-kidtube-primary hover:bg-kidtube-highlight"
                >
                  Sort Results
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                <DropdownMenuItem>Subscribers (High to Low)</DropdownMenuItem>
                <DropdownMenuItem>Subscribers (Low to High)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {channels.length > 0 ? (
            <div id="channel-grid-container">
              <ChannelGrid
                channels={channels}
                onUnsubscribe={handleUnsubscribe}
              />

              {/* Pagination controls - simplified to just Next/Previous */}
              {(nextPageToken || prevPageToken) && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      {/* Previous page button */}
                      {prevPageToken && (
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePrevPage();
                            }}
                            className="text-kidtube-primary hover:text-kidtube-primary/90 hover:bg-kidtube-highlight"
                          />
                        </PaginationItem>
                      )}

                      {/* Next page button */}
                      {nextPageToken && (
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNextPage();
                            }}
                            className="text-kidtube-primary hover:text-kidtube-primary/90 hover:bg-kidtube-highlight"
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No channels found"
              description={
                searchTerm || categoryFilter !== "all" || showKidFriendlyOnly
                  ? "Try adjusting your filters to see more channels"
                  : "No channels found in your subscriptions"
              }
              actionLabel={
                searchTerm || categoryFilter !== "all" || showKidFriendlyOnly
                  ? "Clear filters"
                  : "Refresh"
              }
              onAction={
                searchTerm || categoryFilter !== "all" || showKidFriendlyOnly
                  ? () => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setShowKidFriendlyOnly(false);
                      // Fetch channels with cleared filters
                      fetchChannels(true);
                    }
                  : () => fetchChannels(true)
              }
            />
          )}
        </>
      )}
    </div>
  );
}
