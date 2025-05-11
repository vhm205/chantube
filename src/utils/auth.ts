import { AuthData } from "@/types";
import { getAuthData, clearAuthData } from "./storage";

/**
 * Checks if the current auth token is expired or about to expire
 * @param bufferSeconds - Buffer time in seconds before actual expiration (default: 300 seconds = 5 minutes)
 * @returns true if token is expired or about to expire, false otherwise
 */
export const isTokenExpiredOrExpiring = (bufferSeconds = 300): boolean => {
  const authData = getAuthData();
  if (!authData) return true;
  
  // Check if token is expired or will expire soon
  const now = Date.now();
  const bufferMs = bufferSeconds * 1000;
  return now > (authData.expiresAt - bufferMs);
};

/**
 * Handles token expiration by clearing auth data if token is expired
 * @returns true if token is valid, false if expired and cleared
 */
export const handleTokenExpiration = (): boolean => {
  if (isTokenExpiredOrExpiring()) {
    // Token is expired or about to expire, clear auth data
    clearAuthData();
    return false;
  }
  return true;
};
