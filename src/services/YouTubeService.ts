import { Channel } from "@/types";
import { YOUTUBE_API_BASE_URL, YOUTUBE_API_MAX_RESULTS } from "@/config";
import { getAuthData } from "@/utils/storage";
import { handleTokenExpiration } from "@/utils/auth";

// Add cache storage
interface SubscriptionCache {
  timestamp: number;
  data: Channel[];
  userId?: string; // Add user ID to track which user the cache belongs to
}

// YouTube API response interfaces
interface YouTubeSubscriptionResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSubscriptionItem[];
}

interface YouTubeSubscriptionItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    resourceId: {
      kind: string;
      channelId: string;
    };
    channelId: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
  };
  contentDetails?: {
    totalItemCount: number;
    newItemCount: number;
    activityType: string;
  };
  subscriberSnippet?: {
    title: string;
    description: string;
    channelId: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
  };
}

interface YouTubeChannelResponse {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeChannelItem[];
}

interface YouTubeChannelItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
    localized?: {
      title: string;
      description: string;
    };
    country?: string;
  };
  statistics?: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
  topicDetails?: {
    topicIds: string[];
    topicCategories: string[];
  };
}

// This service will handle all YouTube API interactions
class YouTubeService {
  private accessToken: string | null = null;
  private readonly API_BASE_URL = YOUTUBE_API_BASE_URL;
  private readonly MAX_RESULTS_PER_PAGE = YOUTUBE_API_MAX_RESULTS;
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private subscriptionCache: SubscriptionCache | null = null;

  constructor() {
    // Try to load token from localStorage on initialization
    this.loadTokenFromStorage();
    // Load cache from localStorage
    this.loadCacheFromStorage();
  }

  /**
   * Loads the access token from localStorage if available
   */
  private loadTokenFromStorage() {
    const authData = getAuthData();
    if (authData && authData.accessToken) {
      this.accessToken = authData.accessToken;
    }
  }

  /**
   * Loads subscription cache from localStorage
   */
  private loadCacheFromStorage() {
    const cachedData = localStorage.getItem("youtube_subscriptions_cache");
    if (cachedData) {
      try {
        this.subscriptionCache = JSON.parse(cachedData);
      } catch (error) {
        console.error("Error parsing cache:", error);
        this.subscriptionCache = null;
      }
    }
  }

  /**
   * Saves subscription data to cache
   */
  private saveToCache(data: Channel[]) {
    // Get current user ID from auth data
    const authData = getAuthData();
    const userId = authData?.user?.id;

    const cacheData: SubscriptionCache = {
      timestamp: Date.now(),
      data,
      userId, // Store the user ID with the cache
    };
    this.subscriptionCache = cacheData;
    localStorage.setItem(
      "youtube_subscriptions_cache",
      JSON.stringify(cacheData)
    );
  }

  /**
   * Checks if cache is valid
   */
  private isCacheValid(): boolean {
    if (!this.subscriptionCache) return false;

    // Check if cache has expired
    const now = Date.now();
    const isNotExpired = now - this.subscriptionCache.timestamp < this.CACHE_EXPIRY;

    // Check if cache belongs to current user
    const authData = getAuthData();
    const currentUserId = authData?.user?.id;
    const isSameUser = !currentUserId || !this.subscriptionCache.userId ||
                       currentUserId === this.subscriptionCache.userId;

    return isNotExpired && isSameUser;
  }

  /**
   * Checks if cache belongs to a different user
   */
  private isCacheFromDifferentUser(): boolean {
    if (!this.subscriptionCache || !this.subscriptionCache.userId) return false;

    const authData = getAuthData();
    const currentUserId = authData?.user?.id;

    return !!currentUserId && currentUserId !== this.subscriptionCache.userId;
  }

  /**
   * Sets the access token for API requests
   */
  setAccessToken(token: string) {
    this.accessToken = token;

    // Check if cache belongs to a different user and clear it if so
    if (this.isCacheFromDifferentUser()) {
      console.log("Detected login from a different user. Clearing cache...");
      this.clearCache();
    }
  }

  /**
   * Clears the access token
   */
  clearAccessToken() {
    this.accessToken = null;
  }

  /**
   * Checks if the service has a valid access token
   */
  hasAccessToken(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get subscriptions with pagination support
   * @param pageToken Optional page token for pagination
   * @param maxResults Number of results per page (default: 50)
   * @returns Object containing channels and pagination info
   */
  async getSubscriptions(pageToken?: string, maxResults: number = 50): Promise<{
    channels: Channel[];
    nextPageToken?: string;
    prevPageToken?: string;
    totalResults?: number;
  }> {
    // Check if token exists
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    // Check if token is expired
    if (!handleTokenExpiration()) {
      this.clearAccessToken();
      throw new Error("Authentication token expired");
    }

    try {
      // If no pageToken is provided and we have valid cached data for the first page
      if (!pageToken && this.isCacheValid() && this.subscriptionCache) {
        console.log("Using cached subscription data for first page");
        return {
          channels: this.subscriptionCache.data.slice(0, maxResults),
          nextPageToken: this.subscriptionCache.data.length > maxResults ? "1" : undefined,
          totalResults: this.subscriptionCache.data.length
        };
      }

      // If we're requesting a specific page from cache
      if (pageToken && this.isCacheValid() && this.subscriptionCache && !isNaN(Number(pageToken))) {
        const pageNum = Number(pageToken);
        const startIndex = pageNum * maxResults;
        const endIndex = startIndex + maxResults;

        if (startIndex < this.subscriptionCache.data.length) {
          console.log(`Using cached subscription data for page ${pageNum}`);
          return {
            channels: this.subscriptionCache.data.slice(startIndex, endIndex),
            prevPageToken: pageNum > 0 ? (pageNum - 1).toString() : undefined,
            nextPageToken: endIndex < this.subscriptionCache.data.length ? (pageNum + 1).toString() : undefined,
            totalResults: this.subscriptionCache.data.length
          };
        }
      }

      // Fetch a page of subscriptions directly from the API
      const response = await this.fetchSubscriptionsPage(pageToken, maxResults);

      // Map API response to our Channel interface
      let channels = this.mapSubscriptionsToChannels(response);

      // Get additional channel details (like subscriber counts) for each subscription
      channels = await this.enrichSubscriptionsWithChannelDetails(channels);

      // If this is the first page, save to cache
      if (!pageToken) {
        this.saveToCache(channels);
      }

      return {
        channels,
        nextPageToken: response.nextPageToken,
        prevPageToken: pageToken || undefined,
        totalResults: response.pageInfo.totalResults
      };
    } catch (error) {
      console.error("Error fetching subscriptions:", error);

      // If we have any cached data, return it as fallback
      if (this.subscriptionCache) {
        console.log("Falling back to cached data due to API error");

        // If requesting a specific page
        if (pageToken && !isNaN(Number(pageToken))) {
          const pageNum = Number(pageToken);
          const startIndex = pageNum * maxResults;
          const endIndex = startIndex + maxResults;

          return {
            channels: this.subscriptionCache.data.slice(startIndex, endIndex),
            prevPageToken: pageNum > 0 ? (pageNum - 1).toString() : undefined,
            nextPageToken: endIndex < this.subscriptionCache.data.length ? (pageNum + 1).toString() : undefined,
            totalResults: this.subscriptionCache.data.length
          };
        }

        // Return first page
        return {
          channels: this.subscriptionCache.data.slice(0, maxResults),
          nextPageToken: this.subscriptionCache.data.length > maxResults ? "1" : undefined,
          totalResults: this.subscriptionCache.data.length
        };
      }

      throw error;
    }
  }

  /**
   * Legacy method to get all subscriptions at once (for backward compatibility)
   */
  async getAllSubscriptions(): Promise<Channel[]> {
    const result = await this.getSubscriptions();
    return result.channels;
  }

  async unsubscribeFromChannel(channelId: string): Promise<boolean> {
    // Check if token exists
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    // Check if token is expired
    if (!handleTokenExpiration()) {
      this.clearAccessToken();
      throw new Error("Authentication token expired");
    }

    try {
      // First, find the subscription ID for this channel
      const subscriptionId = await this.findSubscriptionId(channelId);

      if (!subscriptionId) {
        throw new Error(`Subscription not found for channel ${channelId}`);
      }

      // Delete the subscription using the subscription ID
      const url = `${this.API_BASE_URL}/subscriptions?id=${subscriptionId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Check for permission issues
        if (response.status === 403) {
          // If it's a permission issue, we need to re-authenticate with proper scopes
          if (errorText.includes("insufficient authentication scopes") ||
              errorText.includes("insufficientPermissions") ||
              errorText.includes("ACCESS_TOKEN_SCOPE_INSUFFICIENT")) {
            throw new Error(
              "You need to re-login with additional permissions to unsubscribe from channels. Please sign out and sign in again."
            );
          }
        }

        throw new Error(
          `Failed to unsubscribe: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      // Update cache after successful unsubscribe
      if (this.subscriptionCache) {
        this.subscriptionCache.data = this.subscriptionCache.data.filter(
          (channel) => channel.id !== channelId
        );
        this.saveToCache(this.subscriptionCache.data);
      }

      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      throw error;
    }
  }

  /**
   * Finds the subscription ID for a given channel ID
   */
  private async findSubscriptionId(channelId: string): Promise<string | null> {
    const params = new URLSearchParams({
      part: "snippet",
      forChannelId: channelId,
      mine: "true",
      maxResults: "1",
    });

    const url = `${this.API_BASE_URL}/subscriptions?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to find subscription: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as YouTubeSubscriptionResponse;

    if (data.items && data.items.length > 0) {
      return data.items[0].id;
    }

    return null;
  }

  async filterKidFriendlyChannels(channels: Channel[]): Promise<Channel[]> {
    try {
      // This is a simplified implementation that uses channel categories and titles
      // to determine if content is kid-friendly
      // In a production app, you would use a more sophisticated approach or an AI service

      return channels.map((channel) => {
        // Check if channel has a kid-friendly category
        const kidFriendlyCategories = [
          "Education",
          "Music",
          "Family",
          "Kids",
          "Animation",
        ];
        const hasKidFriendlyCategory =
          channel.category &&
          kidFriendlyCategories.some((cat) =>
            channel.category?.toLowerCase().includes(cat.toLowerCase())
          );

        // Check if channel title contains kid-friendly keywords
        const kidFriendlyKeywords = [
          "kids",
          "child",
          "children",
          "family",
          "learning",
          "education",
          "cartoon",
          "animation",
          "nursery",
          "rhymes",
          "baby",
          "toddler",
          "preschool",
        ];
        const hasKidFriendlyTitle = kidFriendlyKeywords.some((keyword) =>
          channel.title.toLowerCase().includes(keyword.toLowerCase())
        );

        // Check if description contains kid-friendly keywords
        const hasKidFriendlyDescription =
          channel.description &&
          kidFriendlyKeywords.some((keyword) =>
            channel.description?.toLowerCase().includes(keyword.toLowerCase())
          );

        // Mark as kid-friendly if it matches any of the criteria
        const isKidFriendly =
          hasKidFriendlyCategory ||
          hasKidFriendlyTitle ||
          hasKidFriendlyDescription;

        return {
          ...channel,
          isKidFriendly,
        };
      });
    } catch (error) {
      console.error("Error filtering channels:", error);
      throw error;
    }
  }

  /**
   * Fetches all subscriptions from YouTube API with pagination
   */
  private async fetchAllSubscriptions(): Promise<Channel[]> {
    let allSubscriptions: Channel[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      // Fetch a page of subscriptions
      const response = await this.fetchSubscriptionsPage(nextPageToken);

      // Map API response to our Channel interface
      const subscriptions = this.mapSubscriptionsToChannels(response);

      // Add to our collection
      allSubscriptions = [...allSubscriptions, ...subscriptions];

      // Update the page token for the next iteration
      nextPageToken = response.nextPageToken;

      console.log(
        `Fetched ${subscriptions.length} subscriptions. Total so far: ${allSubscriptions.length}`
      );
    } while (nextPageToken);

    return allSubscriptions;
  }

  /**
   * Fetches a single page of subscriptions from the YouTube API
   */
  private async fetchSubscriptionsPage(
    pageToken?: string,
    maxResults: number = 50
  ): Promise<YouTubeSubscriptionResponse> {
    const params = new URLSearchParams({
      part: "snippet,contentDetails",
      mine: "true",
      maxResults: maxResults.toString(),
      order: "alphabetical",
    });

    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    const url = `${this.API_BASE_URL}/subscriptions?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Check specifically for quota exceeded error
      if (response.status === 403 && errorText.includes("quota")) {
        throw new Error("YouTube API quota exceeded. Please try again later.");
      }

      throw new Error(
        `Failed to fetch subscriptions: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Maps YouTube API subscription response to our Channel interface
   */
  private mapSubscriptionsToChannels(
    response: YouTubeSubscriptionResponse
  ): Channel[] {
    return response.items.map((item) => ({
      id: item.snippet.resourceId.channelId,
      title: item.snippet.title,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          item.snippet.title
        )}`,
      description: item.snippet.description,
      // Add YouTube channel URL
      url: `https://www.youtube.com/channel/${item.snippet.resourceId.channelId}`,
      // We'll get subscriber count in a separate call
      subscriberCount: undefined,
      isKidFriendly: undefined,
      category: undefined,
    }));
  }

  /**
   * Enriches subscription data with additional channel details
   */
  private async enrichSubscriptionsWithChannelDetails(
    subscriptions: Channel[]
  ): Promise<Channel[]> {
    // YouTube API limits the number of IDs we can request at once
    const BATCH_SIZE = 50;
    const enrichedSubscriptions: Channel[] = [];

    // Process in batches
    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE);
      const channelIds = batch.map((sub) => sub.id);

      try {
        const channelDetails = await this.fetchChannelDetails(channelIds);

        // Merge the channel details with our subscription data
        const enrichedBatch = batch.map((subscription) => {
          const details = channelDetails.items.find(
            (item) => item.id === subscription.id
          );

          if (!details) return subscription;

          // Extract category from topic details if available
          let category = undefined;
          if (details.topicDetails?.topicCategories?.length) {
            // Topic categories are full URLs, extract the last part
            const topicUrl = details.topicDetails.topicCategories[0];
            const parts = topicUrl.split("/");
            category = parts[parts.length - 1].replace(/_/g, " ");
          }

          return {
            ...subscription,
            subscriberCount: details.statistics?.subscriberCount || undefined,
            category,
          };
        });

        enrichedSubscriptions.push(...enrichedBatch);
      } catch (error) {
        console.error(
          `Error fetching details for batch ${i}-${i + BATCH_SIZE}:`,
          error
        );
        // Add the batch without enrichment rather than failing completely
        enrichedSubscriptions.push(...batch);
      }
    }

    return enrichedSubscriptions;
  }

  /**
   * Fetches detailed information about channels
   */
  private async fetchChannelDetails(
    channelIds: string[]
  ): Promise<YouTubeChannelResponse> {
    const params = new URLSearchParams({
      part: "snippet,statistics,topicDetails",
      id: channelIds.join(","),
      maxResults: "50",
    });

    const url = `${this.API_BASE_URL}/channels?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch channel details: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  // Add method to clear cache
  clearCache() {
    this.subscriptionCache = null;
    localStorage.removeItem("youtube_subscriptions_cache");
  }
}

export const youtubeService = new YouTubeService();
