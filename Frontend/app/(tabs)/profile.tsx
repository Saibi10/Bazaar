import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={40} color="#9370DB" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>Guest User</Text>
                        <TouchableOpacity 
                            style={styles.loginButton} 
                            onPress={() => router.push("/login")}
                        >
                            <Text style={styles.loginButtonText}>Login / Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <MenuItem 
                        icon="cart-outline" 
                        title="My Orders" 
                        subtitle="Track, return, or buy things again" 
                        route="/display-orders"
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

function MenuItem({ icon, title, subtitle, route }) {
    const router = useRouter();

    return (
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push(route)}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={24} color="#9370DB" />
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

