import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserContext } from '../context/userContext'; // Adjust the path as needed

const { width } = Dimensions.get('window');

// Sample categories
const exploreCategories = [
  { id: '1', title: 'Electronics', image: require('../../assets/images/emoji1.png'), color: '#9370DB' },
  { id: '2', title: 'Fashion', image: require('../../assets/images/emoji2.png'), color: '#FF7675' },
  { id: '3', title: 'Home & Living', image: require('../../assets/images/emoji3.png'), color: '#74B9FF' },
  { id: '4', title: 'Beauty', image: require('../../assets/images/emoji4.png'), color: '#55EFC4' },
  { id: '5', title: 'Toys', image: require('../../assets/images/emoji5.png'), color: '#FDCB6E' },
  { id: '6', title: 'Sports', image: require('../../assets/images/emoji6.png'), color: '#E17055' },
];

// Sample products
const products = [
  { id: '1', name: 'Smartphone', category: 'Electronics', price: '$699', image: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Laptop', category: 'Electronics', price: '$1299', image: 'https://via.placeholder.com/150' },
  { id: '3', name: 'T-Shirt', category: 'Fashion', price: '$19.99', image: 'https://via.placeholder.com/150' },
  { id: '4', name: 'Sofa', category: 'Home & Living', price: '$499', image: 'https://via.placeholder.com/150' },
  { id: '5', name: 'Lipstick', category: 'Beauty', price: '$9.99', image: 'https://via.placeholder.com/150' },
  { id: '6', name: 'Action Figure', category: 'Toys', price: '$14.99', image: 'https://via.placeholder.com/150' },
  { id: '7', name: 'Football', category: 'Sports', price: '$29.99', image: 'https://via.placeholder.com/150' },
  { id: '8', name: 'Headphones', category: 'Electronics', price: '$199', image: 'https://via.placeholder.com/150' },
  { id: '9', name: 'Jeans', category: 'Fashion', price: '$49.99', image: 'https://via.placeholder.com/150' },
  { id: '10', name: 'Table Lamp', category: 'Home & Living', price: '$29.99', image: 'https://via.placeholder.com/150' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const context = useContext(UserContext);

  // Debugging: Check if context is undefined
  if (!context) {
    console.error("UserContext is undefined. Make sure the provider is properly set up.");
    return null; // Or show a loading spinner
  }

  const { user, token } = context;

  // Get random products (from any category)
  const getRandomProducts = (count: number) => {
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const randomProducts = getRandomProducts(4); // Display 4 random products

  // Handle category press
  const handleCategoryPress = (category: string) => {
    const filteredProducts = products.filter((product) => product.category === category);
    router.push({ pathname: '/category-products', params: { category, products: JSON.stringify(filteredProducts) } });
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8A8A8A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Product Name/ Code/ Supplier"
          placeholderTextColor="#8A8A8A"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/600x300/9370DB/FFFFFF?text=Special+Discount' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>SPECIAL DISCOUNT</Text>
            <Text style={styles.bannerSubtitle}>ON PREPAID</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>UP TO</Text>
              <Text style={styles.discountAmount}>40% OFF</Text>
            </View>
            <Text style={styles.bannerInfo}>on 3000+ Products</Text>
          </View>
        </View>

        {/* Offers */}
        <TouchableOpacity style={styles.offersContainer}>
          <View style={styles.offerIconContainer}>
            <Ionicons name="gift-outline" size={24} color="#9370DB" />
          </View>
          <Text style={styles.offersText}>2 offers are available for you!</Text>
          <Ionicons name="chevron-forward" size={20} color="#9370DB" />
        </TouchableOpacity>

        {/* Explore More */}
        <View style={styles.exploreSection}>
          <Text style={styles.sectionTitle}>Explore More</Text>

          {/* Categories */}
          <FlatList
            data={exploreCategories}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exploreCategoryItem}
                onPress={() => handleCategoryPress(item.title)}
              >
                <View style={[styles.exploreCategoryImageContainer, { backgroundColor: item.color + '20' }]}>
                  <View style={[styles.exploreCategoryIcon, { backgroundColor: item.color }]}>
                    <Ionicons
                      name={
                        item.title === 'Electronics' ? 'phone-portrait-outline' :
                          item.title === 'Fashion' ? 'shirt-outline' :
                            item.title === 'Home & Living' ? 'home-outline' :
                              item.title === 'Beauty' ? 'color-palette-outline' :
                                item.title === 'Toys' ? 'game-controller-outline' :
                                  'basketball-outline'
                      }
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
                <Text style={styles.exploreCategoryTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />

          {/* Random Products */}
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <FlatList
            data={randomProducts}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 16,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  discountText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  discountAmount: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerInfo: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  offersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
  },
  offerIconContainer: {
    backgroundColor: '#9370DB20',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offersText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  exploreSection: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exploreCategoryItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  exploreCategoryImageContainer: {
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  exploreCategoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreCategoryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
    maxHeight: '80%',
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
    color: '#FFFFFF',
  },
  modalContent: {
    padding: 16,
  },
  productItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
    marginHorizontal: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    color: '#9370DB',
    fontSize: 16,
    fontWeight: 'bold',
  },
});