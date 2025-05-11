import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User, AuthContextType, AuthData } from "@/types";
import { youtubeService } from "@/services/YouTubeService";
import {
  GoogleOAuthProvider,
  googleLogout,
  useGoogleLogin,
} from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/config";
import {
  saveAuthData,
  getAuthData,
  clearAuthData,
  isAuthValid,
} from "@/utils/storage";
import { handleTokenExpiration } from "@/utils/auth";

// Create a context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
});

// Google OAuth client ID is imported from config

// Create a provider component
export function AuthProviderContent({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize authentication state from localStorage
    return isAuthValid();
  });
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user from localStorage
    const authData = getAuthData();
    return authData?.user || null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Effect to initialize auth state from localStorage
  useEffect(() => {
    // Check if we have valid auth data in localStorage
    if (isAuthValid() && handleTokenExpiration()) {
      const authData = getAuthData();
      if (authData) {
        // Set the access token in the YouTube service
        youtubeService.setAccessToken(authData.accessToken);
        setUser(authData.user);
        setIsAuthenticated(true);
      }
    } else {
      // Clear invalid or expired auth data
      clearAuthData();
      youtubeService.clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Configure Google OAuth login
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true);

        // Get the access token from the response
        const accessToken = response.access_token;

        // Calculate token expiration (default to 1 hour if not provided)
        // Google OAuth tokens typically expire in 1 hour
        const expiresIn = response.expires_in || 3600; // seconds
        const expiresAt = Date.now() + expiresIn * 1000;

        // Set the access token in the YouTube service
        youtubeService.setAccessToken(accessToken);

        // Fetch user profile information
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userInfo = await userInfoResponse.json();

        // Create user object from Google profile
        const googleUser: User = {
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          imageUrl: userInfo.picture,
        };

        // Create auth data object for storage
        const authData: AuthData = {
          accessToken,
          expiresAt,
          user: googleUser,
        };

        // Save auth data to localStorage
        saveAuthData(authData);

        // Update auth state
        setUser(googleUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setIsLoading(false);
    },
    scope: "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl email profile",
    flow: "implicit",
  });

  // Login function that triggers Google OAuth
  const login = async () => {
    setIsLoading(true);
    try {
      // Trigger Google OAuth login
      googleLogin();
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear YouTube service token
    youtubeService.clearAccessToken();

    // Clear auth data from localStorage
    clearAuthData();

    // Logout from Google
    googleLogout();

    // Update auth state
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Wrapper that includes Google OAuth Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </GoogleOAuthProvider>
  );
}

// Create a custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);
