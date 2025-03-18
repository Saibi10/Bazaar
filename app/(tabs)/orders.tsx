import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const orderStatuses = [
    { id: '1', title: 'In-progress', selected: true },
    { id: '2', title: 'Delivered', selected: false },
    { id: '3', title: 'Returned', selected: false },
];

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('In-progress');

    const handleTabPress = (tabTitle) => {
        setActiveTab(tabTitle);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Bazaar</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Order Status Tabs */}
            <View style={styles.tabsContainer}>
                {orderStatuses.map((status) => (
                    <TouchableOpacity
                        key={status.id}
                        style={[
                            styles.tabButton,
                            activeTab === status.title && styles.activeTabButton,
                        ]}
                        onPress={() => handleTabPress(status.title)}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === status.title && styles.activeTabButtonText,
                            ]}
                        >
                            {status.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {!isLoggedIn ? (
                    // Not logged in state
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyStateImageContainer}>
                            <Ionicons name="cube-outline" size={100} color="#6C5CE7" />
                        </View>
                        <Text style={styles.emptyStateTitle}>
                            Please login to view your orders
                        </Text>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.push("../login")}
                        >
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                ) : activeTab === 'In-progress' ? (
                    // In-progress orders (sample data)
                    <View style={styles.ordersContainer}>
                        <OrderCard
                            orderNumber="ORD-12345"
                            date="March 18, 2025"
                            items={3}
                            total="$120.00"
                            status="Processing"
                        />
                        <OrderCard
                            orderNumber="ORD-12346"
                            date="March 17, 2025"
                            items={1}
                            total="$45.99"
                            status="Shipped"
                        />
                    </View>
                ) : activeTab === 'Delivered' ? (
                    // Delivered orders (sample data)
                    <View style={styles.ordersContainer}>
                        <OrderCard
                            orderNumber="ORD-12340"
                            date="March 10, 2025"
                            items={2}
                            total="$78.50"
                            status="Delivered"
                            isDelivered
                        />
                        <OrderCard
                            orderNumber="ORD-12338"
                            date="March 5, 2025"
                            items={4}
                            total="$156.75"
                            status="Delivered"
                            isDelivered
                        />
                    </View>
                ) : (
                    // Returned orders
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyStateImageContainer}>
                            <Ionicons name="return-down-back-outline" size={80} color="#6C5CE7" />
                        </View>
                        <Text style={styles.emptyStateTitle}>
                            No returned orders
                        </Text>
                        <Text style={styles.emptyStateSubtitle}>
                            You don't have any returned orders yet
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function OrderCard({ orderNumber, date, items, total, status, isDelivered = false }) {
    return (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>{orderNumber}</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: isDelivered ? '#55EFC4' : '#6C5CE7' }
                ]}>
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <Text style={styles.orderDate}>Order Date: {date}</Text>
                <Text style={styles.orderItems}>Items: {items}</Text>
                <Text style={styles.orderTotal}>Total: {total}</Text>
            </View>

            <View style={styles.orderActions}>
                <TouchableOpacity style={styles.orderActionButton}>
                    <Text style={styles.orderActionButtonText}>View Details</Text>
                </TouchableOpacity>

                {isDelivered && (
                    <TouchableOpacity style={[styles.orderActionButton, styles.secondaryActionButton]}>
                        <Text style={styles.secondaryActionButtonText}>Buy Again</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6C5CE7',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#6C5CE7',
    },
    activeTabButton: {
        backgroundColor: '#6C5CE7',
    },
    tabButtonText: {
        color: '#6C5CE7',
        fontWeight: '600',
    },
    activeTabButtonText: {
        color: '#FFFFFF',
    },
    contentContainer: {
        flexGrow: 1,
        padding: 16,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyStateImageContainer: {
        marginBottom: 24,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#8A8A8A',
        textAlign: 'center',
        marginBottom: 24,
    },
    loginButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    ordersContainer: {
        flex: 1,
    },
    orderCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    orderDetails: {
        marginBottom: 16,
    },
    orderDate: {
        color: '#BBBBBB',
        marginBottom: 4,
    },
    orderItems: {
        color: '#BBBBBB',
        marginBottom: 4,
    },
    orderTotal: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    orderActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderActionButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    orderActionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    secondaryActionButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#6C5CE7',
    },
    secondaryActionButtonText: {
        color: '#6C5CE7',
        fontWeight: '600',
    },
});