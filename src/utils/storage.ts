import { AuthData } from "@/types";

// Storage keys
const AUTH_DATA_KEY = "kidtube_auth_data";

/**
 * Saves authentication data to localStorage
 */
export const saveAuthData = (authData: AuthData): void => {
  try {
    localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error("Failed to save auth data to localStorage:", error);
  }
};

/**
 * Retrieves authentication data from localStorage
 */
export const getAuthData = (): AuthData | null => {
  try {
    const data = localStorage.getItem(AUTH_DATA_KEY);
    if (!data) return null;
    
    return JSON.parse(data) as AuthData;
  } catch (error) {
    console.error("Failed to retrieve auth data from localStorage:", error);
    return null;
  }
};

/**
 * Clears authentication data from localStorage
 */
export const clearAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_DATA_KEY);
  } catch (error) {
    console.error("Failed to clear auth data from localStorage:", error);
  }
};

/**
 * Checks if the stored authentication token is valid (not expired)
 */
export const isAuthValid = (): boolean => {
  try {
    const authData = getAuthData();
    if (!authData) return false;
    
    // Check if token is expired
    const now = Date.now();
    return now < authData.expiresAt;
  } catch (error) {
    console.error("Failed to validate auth data:", error);
    return false;
  }
};
