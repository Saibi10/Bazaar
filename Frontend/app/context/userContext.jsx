// context/userContext.jsx
import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context with default values
export const UserContext = createContext({
    user: null,
    token: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
});

// Create the provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use refs to prevent multiple refreshes happening at once
    const isRefreshing = useRef(false);
    const refreshTimeoutRef = useRef(null);
    const refreshDebounceTime = 2000; // 2 seconds between refresh attempts

    // Load user data from AsyncStorage on app start
    useEffect(() => {
        // Only load initially
        const performInitialLoad = async () => {
            await loadUser();
        };

        performInitialLoad();

        // Cleanup any pending refresh timeout
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    const loadUser = async () => {
        try {
            // Don't set loading state if we're just refreshing
            if (!isRefreshing.current) {
                setIsLoading(true);
            }
            setError(null);

            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                } catch (e) {
                    console.error('Error parsing stored user data:', e);
                    // Invalid JSON in storage, clear it
                    await AsyncStorage.removeItem('user');
                }
            } else {
                // No user data in storage
                setUser(null);
                setToken(null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setError('Failed to load user data');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        // If already refreshing, don't refresh again
        if (isRefreshing.current) {
            console.log("Refresh already in progress, skipping");
            return;
        }

        // Clear any pending refresh
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }

        try {
            isRefreshing.current = true;
            setError(null);

            const storedToken = await AsyncStorage.getItem('token');

            if (!storedToken) {
                // No token found, user is not logged in
                return;
            }

            // Just load from AsyncStorage first without API call
            await loadUser();

            // Using a ref to track the mounted state
            let isMounted = true;

            // Only call API if we have a valid token
            const apiBaseUrl = process.env.EXPO_PUBLIC_APIBASE_URL;
            if (!apiBaseUrl) {
                console.error('API base URL is not defined');
                return;
            }

            const response = await fetch(`${apiBaseUrl}/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // Only update state if component is still mounted
            if (isMounted) {
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.user) {
                        // Update user state and AsyncStorage
                        setUser(data.user);
                        await AsyncStorage.setItem('user', JSON.stringify(data.user));
                    }
                } else {
                    // If API request fails, check if it's an auth error
                    if (response.status === 401) {
                        // Token expired or invalid
                        logout();
                    }
                }
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            setError('Failed to refresh user data');
        } finally {
            // Set a timeout before allowing another refresh
            refreshTimeoutRef.current = setTimeout(() => {
                isRefreshing.current = false;
                refreshTimeoutRef.current = null;
            }, refreshDebounceTime);
        }
    };

    const login = (userData, authToken) => {
        if (!userData || !authToken) {
            console.error('Invalid login data provided');
            return;
        }

        setUser(userData);
        setToken(authToken);

        // Store in AsyncStorage
        Promise.all([
            AsyncStorage.setItem('token', authToken),
            AsyncStorage.setItem('user', JSON.stringify(userData))
        ]).catch(err => {
            console.error('Error storing auth data:', err);
        });
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        // Clear from AsyncStorage
        Promise.all([
            AsyncStorage.removeItem('token'),
            AsyncStorage.removeItem('user')
        ]).catch(err => {
            console.error('Error removing auth data:', err);
        });
    };

    const contextValue = {
        user,
        token,
        login,
        logout,
        refreshUser,
        isLoading,
        error
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};