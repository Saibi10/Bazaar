import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserContext } from '../context/userContext';
import axios from 'axios';

interface Order {
    _id: string;
    items: Array<{
        product: {
            _id: string;
            name: string;
            price: number;
        };
        quantity: number;
    }>;
    totalAmount: number;
    status: 'COMPLETED' | 'RETURNED' | 'IN PROGRESS';
    orderDate: string;
    deliveryDate?: string;
}

const orderStatuses = [
    { id: '1', title: 'IN PROGRESS', selected: true },
    { id: '2', title: 'COMPLETED', selected: false },
    { id: '3', title: 'RETURNED', selected: false },
];

const URL = process.env.EXPO_PUBLIC_APIBASE_URL;
const API_URL = `${URL}/orders`;

interface OrderCardProps {
    orderNumber: string;
    date: string;
    items: number;
    total: string;
    status: string;
    isDelivered: boolean;
}

const OrderCard = ({ orderNumber, date, items, total, status, isDelivered }: OrderCardProps) => (
    <View style={orderStyles.container}>
        <View style={orderStyles.header}>
            <Text style={orderStyles.orderNumber}>Order #{orderNumber}</Text>
            <Text style={orderStyles.date}>{date}</Text>
        </View>
        <View style={orderStyles.details}>
            <Text style={orderStyles.items}>{items} items</Text>
            <Text style={orderStyles.total}>{total}</Text>
        </View>
        <View style={orderStyles.footer}>
            <View style={[orderStyles.statusBadge, isDelivered && orderStyles.deliveredBadge]}>
                <Text style={orderStyles.statusText}>{status}</Text>
            </View>
        </View>
    </View>
);

const orderStyles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    orderNumber: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        color: '#999999',
        fontSize: 14,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    items: {
        color: '#CCCCCC',
        fontSize: 14,
    },
    total: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    statusBadge: {
        backgroundColor: '#2A2A2A',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    deliveredBadge: {
        backgroundColor: '#9370DB',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>('IN PROGRESS');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const context = useContext(UserContext);

    if (!context) {
        console.error("UserContext is undefined. Make sure the provider is properly set up.");
        return null;
    }

    const { user, token } = context;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!user?._id || !token) {
                    throw new Error('User not authenticated');
                }

                const response = await axios.get(`${API_URL}/${user._id}`, {
                    params: {
                        status: activeTab
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                setOrders(response.data);
            } catch (err: any) {
                console.error('Failed to fetch orders:', err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to fetch orders'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [activeTab, user?._id, token]);

    const handleTabPress = (tabTitle: string) => {
        setActiveTab(tabTitle);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusDisplayText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'Delivered';
            case 'IN PROGRESS':
                return 'Processing';
            case 'RETURNED':
                return 'Returned';
            default:
                return status;
        }
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
                            {getStatusDisplayText(status.title)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Orders List */}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#9370DB" />
                    </View>
                ) : error ? (
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => setActiveTab(activeTab)} // This will trigger the useEffect
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : orders.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyStateImageContainer}>
                            <Ionicons
                                name={activeTab === 'RETURNED' ? "return-down-back-outline" : "receipt-outline"}
                                size={80}
                                color="#9370DB"
                            />
                        </View>
                        <Text style={styles.emptyStateTitle}>
                            No {getStatusDisplayText(activeTab).toLowerCase()} orders
                        </Text>
                        <Text style={styles.emptyStateSubtitle}>
                            You don't have any {getStatusDisplayText(activeTab).toLowerCase()} orders yet
                        </Text>
                    </View>
                ) : (
                    <View style={styles.ordersContainer}>
                        {orders.map((order) => (
                            <OrderCard
                                key={order._id}
                                orderNumber={order._id.substring(0, 8).toUpperCase()}
                                date={formatDate(order.orderDate)}
                                items={order.items.reduce((acc, item) => acc + item.quantity, 0)}
                                total={`$${order.totalAmount.toFixed(2)}`}
                                status={getStatusDisplayText(order.status)}
                                isDelivered={order.status === 'COMPLETED'}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
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
        padding: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        padding: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        marginTop: 8,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    activeTabButton: {
        backgroundColor: '#9370DB',
        borderColor: '#9370DB',
    },
    tabButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 14,
    },
    activeTabButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    contentContainer: {
        flexGrow: 1,
        padding: 16,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 500,
    },
    emptyStateImageContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    emptyStateTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        color: '#999999',
        fontSize: 16,
        textAlign: 'center',
        maxWidth: '80%',
    },
    ordersContainer: {
        gap: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});