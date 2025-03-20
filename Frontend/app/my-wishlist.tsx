import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Sample wishlist data
const wishlistItems = [
    {
        id: '1',
        name: 'Wireless Headphones',
        price: '$99.99',
        image: 'https://via.placeholder.com/150',
        description: 'High-quality wireless headphones with noise cancellation.',
    },
    {
        id: '2',
        name: 'Smart Watch',
        price: '$199.99',
        image: 'https://via.placeholder.com/150',
        description: 'A smartwatch with fitness tracking and heart rate monitoring.',
    },
    {
        id: '3',
        name: 'Bluetooth Speaker',
        price: '$49.99',
        image: 'https://via.placeholder.com/150',
        description: 'Portable Bluetooth speaker with 12-hour battery life.',
    },
];

export default function WishlistScreen() {
    const insets = useSafeAreaInsets();
    const [wishlist, setWishlist] = useState(wishlistItems);
    const [selectedProduct, setSelectedProduct] = useState(null); // Track selected product
    const [modalVisible, setModalVisible] = useState(false); // Control modal visibility

    // Function to remove an item from the wishlist
    const removeFromWishlist = (id: string) => {
        setWishlist(wishlist.filter((item) => item.id !== id));
    };

    // Function to open product details modal
    const openProductDetails = (product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    // Function to close product details modal
    const closeProductDetails = () => {
        setSelectedProduct(null);
        setModalVisible(false);
    };

    // Function to handle "Buy Product" button press
    const handleBuyProduct = () => {
        if (selectedProduct) {
            alert(`You bought ${selectedProduct.name} for ${selectedProduct.price}`);
            closeProductDetails(); // Close the modal after purchase
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

            {/* Wishlist Title */}
            <Text style={styles.screenTitle}>My Wishlist</Text>

            {/* Wishlist Items */}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {wishlist.length === 0 ? (
                    // Empty wishlist state
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyStateImageContainer}>
                            <Ionicons name="heart-dislike-outline" size={80} color="#9370DB" />
                        </View>
                        <Text style={styles.emptyStateTitle}>
                            Your wishlist is empty
                        </Text>
                        <Text style={styles.emptyStateSubtitle}>
                            Add items to your wishlist to save them for later
                        </Text>
                    </View>
                ) : (
                    // Wishlist items
                    wishlist.map((item) => (
                        <WishlistItem
                            key={item.id}
                            name={item.name}
                            price={item.price}
                            image={item.image}
                            onRemove={() => removeFromWishlist(item.id)}
                            onPress={() => openProductDetails(item)} // Open product details modal
                        />
                    ))
                )}
            </ScrollView>

            {/* Product Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeProductDetails}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Product Details</Text>
                            <TouchableOpacity onPress={closeProductDetails}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            {selectedProduct && (
                                <>
                                    <Image
                                        source={{ uri: selectedProduct.image }}
                                        style={styles.productImage}
                                    />
                                    <Text style={styles.productName}>{selectedProduct.name}</Text>
                                    <Text style={styles.productPrice}>{selectedProduct.price}</Text>
                                    <Text style={styles.productDescription}>
                                        {selectedProduct.description}
                                    </Text>

                                    {/* Buy Product Button */}
                                    <TouchableOpacity
                                        style={styles.buyButton}
                                        onPress={handleBuyProduct}
                                    >
                                        <Text style={styles.buyButtonText}>Buy Product</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Define the props for the WishlistItem component
interface WishlistItemProps {
    name: string;
    price: string;
    image: string;
    onRemove: () => void;
    onPress: () => void; // Add onPress prop
}

function WishlistItem({ name, price, image, onRemove, onPress }: WishlistItemProps) {
    return (
        <TouchableOpacity style={styles.wishlistItem} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.wishlistItemImage} />
            <View style={styles.wishlistItemDetails}>
                <Text style={styles.wishlistItemName}>{name}</Text>
                <Text style={styles.wishlistItemPrice}>{price}</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </TouchableOpacity>
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
        color: '#9370DB',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 16,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    wishlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    wishlistItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
    },
    wishlistItemDetails: {
        flex: 1,
    },
    wishlistItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    wishlistItemPrice: {
        fontSize: 14,
        color: '#9370DB',
        fontWeight: 'bold',
    },
    removeButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%', // Limit modal height to 80% of the screen
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalContent: {
        padding: 16,
    },
    productImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 20,
        color: '#9370DB',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    productDescription: {
        fontSize: 16,
        color: '#BBBBBB',
        lineHeight: 24,
    },
    buyButton: {
        backgroundColor: '#9370DB',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default WishlistScreen;