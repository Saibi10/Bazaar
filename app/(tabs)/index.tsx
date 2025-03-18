import React from 'react';
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

const { width } = Dimensions.get('window');

const categories = [
  { id: '1', title: 'All', icon: '🏠', selected: true },
  { id: '2', title: 'Electronics', icon: '📱' },
  { id: '3', title: 'Fashion', icon: '👔' },
  { id: '4', title: 'Beauty', icon: '💄' },
];

const exploreCategories = [
  // { id: '1', title: 'Electronics', image: require('../assets/electronics.png'), color: '#6C5CE7' },
  // { id: '2', title: 'Fashion', image: require('../assets/fashion.png'), color: '#FF7675' },
  // { id: '3', title: 'Home & Living', image: require('../assets/home.png'), color: '#74B9FF' },
  // { id: '4', title: 'Beauty', image: require('../assets/beauty.png'), color: '#55EFC4' },
  // { id: '5', title: 'Toys', image: require('../assets/toys.png'), color: '#FDCB6E' },
  // { id: '6', title: 'Sports', image: require('../assets/sports.png'), color: '#E17055' },
  { id: '1', title: 'Electronics', image: require('../../assets/images/emoji1.png'), color: '#6C5CE7' },
  { id: '2', title: 'Fashion', image: require('../../assets/images/emoji2.png'), color: '#FF7675' },
  { id: '3', title: 'Home & Living', image: require('../../assets/images/emoji3.png'), color: '#74B9FF' },
  { id: '4', title: 'Beauty', image: require('../../assets/images/emoji4.png'), color: '#55EFC4' },
  { id: '5', title: 'Toys', image: require('../../assets/images/emoji5.png'), color: '#FDCB6E' },
  { id: '6', title: 'Sports', image: require('../../assets/images/emoji6.png'), color: '#E17055' },
];

// Note: In a real app, you would need to create these assets or use appropriate images

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

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

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              category.selected && styles.selectedCategoryItem,
            ]}
          >
            <Text style={[
              styles.categoryText,
              category.selected && styles.selectedCategoryText,
            ]}>
              {category.icon} {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/600x300/6C5CE7/FFFFFF?text=Special+Discount' }}
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
            <Ionicons name="gift-outline" size={24} color="#6C5CE7" />
          </View>
          <Text style={styles.offersText}>2 offers are available for you!</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C5CE7" />
        </TouchableOpacity>

        {/* Explore More */}
        <View style={styles.exploreSection}>
          <Text style={styles.sectionTitle}>Explore More</Text>

          <FlatList
            data={exploreCategories}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.exploreCategoryItem}>
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
            keyExtractor={item => item.id}
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
    color: '#6C5CE7',
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
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
  },
  selectedCategoryItem: {
    backgroundColor: '#6C5CE7',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    backgroundColor: '#6C5CE720',
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
});