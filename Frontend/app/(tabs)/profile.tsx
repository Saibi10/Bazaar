import React, { useContext, useCallback, useState, useEffect, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { UserContext } from '../context/userContext';
import Header from '../components/Header';

// Define user type to fix TypeScript errors
interface User {
    _id: string;
    name: string;
    email: string;
    [key: string]: any; // Allow any other properties
}

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const userContext = useContext(UserContext);
    const { user, token, logout, refreshUser, isLoading: contextLoading } = userContext || {};
    const [refreshing, setRefreshing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const lastRefreshTime = useRef(0);
    const minRefreshInterval = 5000; // 5 seconds minimum between refreshes

    // Prevent too frequent refreshes
    const canRefresh = useCallback(() => {
        const now = Date.now();
        if (now - lastRefreshTime.current > minRefreshInterval) {
            lastRefreshTime.current = now;
            return true;
        }
        return false;
    }, []);

    // Function to handle refresh when the screen is pulled down
    const onRefresh = useCallback(async () => {
        if (!refreshUser || !token || refreshing) return;

        setRefreshing(true);
        try {
            await refreshUser();
            setInitialLoadDone(true);
        } catch (error) {
            console.error("Error refreshing profile:", error);
            Alert.alert("Error", "Failed to refresh profile data");
        } finally {
            setRefreshing(false);
            lastRefreshTime.current = Date.now();
        }
    }, [refreshUser, token, refreshing]);

    // Function to refresh when the screen gains focus
    const refreshOnFocus = useCallback(async () => {
        if (!refreshUser || !token || isRefreshing) return;
        if (!canRefresh()) return; // Don't refresh too frequently

        setIsRefreshing(true);
        try {
            await refreshUser();
            setInitialLoadDone(true);
        } catch (error) {
            console.error("Error refreshing on focus:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [refreshUser, token, isRefreshing, canRefresh]);

    // Check if data is loaded initially
    useEffect(() => {
        if (!initialLoadDone && token && !contextLoading && canRefresh()) {
            refreshOnFocus();
        }
    }, [initialLoadDone, token, contextLoading, refreshOnFocus, canRefresh]);

    // Use useFocusEffect to refresh when screen comes into focus - with proper cleanup
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            if (isMounted && !isRefreshing && !initialLoadDone && canRefresh()) {
                refreshOnFocus();
            }

            return () => {
                isMounted = false;
            };
        }, [refreshOnFocus, isRefreshing, initialLoadDone, canRefresh])
    );

    // Show loading state
    if (contextLoading) {
        return (
            <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#9370DB" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            {/* Header */}
            <Header title="Profile" />

            <ScrollView
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#9370DB"
                        colors={["#9370DB"]}
                    />
                }
            >
                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={40} color="#9370DB" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                            {user ? (user as User).name : "Guest User"}
                        </Text>
                        {user ? (
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={() => {
                                    if (logout) {
                                        logout();
                                        router.push("/login");
                                    }
                                }}
                            >
                                <Text style={styles.loginButtonText}>Logout</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={() => router.push("/login")}
                            >
                                <Text style={styles.loginButtonText}>Login / Register</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <MenuItem
                        icon="cart-outline"
                        title="My Orders"
                        subtitle="Track, return, or buy things again"
                        route="/orders"
                    />
                    <MenuItem
                        icon="heart-outline"
                        title="My Wishlist"
                        subtitle="Your saved items"
                        route="/my-wishlist"
                    />
                    <MenuItem
                        icon="location-outline"
                        title="My Addresses"
                        subtitle="Your saved addresses"
                        route="/addresses"
                    />
                    <MenuItem
                        icon="briefcase-outline"
                        title="My Products"
                        subtitle="Sell your products"
                        route="/my-products"
                    />
                    <MenuItem
                        icon="headset-outline"
                        title="Help Center"
                        subtitle="Help and support"
                        route="/help"
                    />
                    <MenuItem
                        icon="settings-outline"
                        title="Settings"
                        subtitle="Privacy and logout"
                        route="/settings"
                    />
                </View>

                {/* App Info */}
                <View style={styles.appInfoSection}>
                    <Text style={styles.appVersion}>Bazaar v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}

interface MenuItemProps {
    icon: any;
    title: string;
    subtitle: string;
    route: any;
}

function MenuItem({ icon, title, subtitle, route }: MenuItemProps) {
    const router = useRouter();

    return (
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push(route as any)}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon as any} size={24} color="#9370DB" />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A8A8A" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 16,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1E1E1E',
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    loginButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    menuSection: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#8A8A8A',
    },
    appInfoSection: {
        alignItems: 'center',
        marginTop: 24,
    },
    appVersion: {
        fontSize: 12,
        color: '#8A8A8A',
    },
});

