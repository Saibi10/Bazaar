import React, { useState, useContext, useEffect } from 'react';
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
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserContext } from '../context/userContext'; // Adjust the path as needed
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

// Product Interface
interface Product {
  _id: string;
  userId: string;
  name: string;
  pics_url: string[];
  category: string[];
  price: number;
  description: string;
  stock: number;
  brand: string;
  ratings: number;
  reviews: {
    user: string;
    comment: string;
    rating: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Sample categories
const exploreCategories = [
  { id: '1', title: 'Electronics', image: require('../../assets/images/emoji1.png'), color: '#9370DB' },
  { id: '2', title: 'Fashion', image: require('../../assets/images/emoji2.png'), color: '#FF7675' },
  { id: '3', title: 'Home & Living', image: require('../../assets/images/emoji3.png'), color: '#74B9FF' },
  { id: '4', title: 'Beauty', image: require('../../assets/images/emoji4.png'), color: '#55EFC4' },
  { id: '5', title: 'Toys', image: require('../../assets/images/emoji5.png'), color: '#FDCB6E' },
  { id: '6', title: 'Sports', image: require('../../assets/images/emoji6.png'), color: '#E17055' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const context = useContext(UserContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleProductCount, setVisibleProductCount] = useState(10);

  // Debugging: Check if context is undefined
  if (!context) {
    console.error("UserContext is undefined. Make sure the provider is properly set up.");
    return null; // Or show a loading spinner
  }

  const { user, token } = context;

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/products");

        // Filter out products where userId matches the current user's ID
        let filteredProducts = response.data;
        if (user && user._id) {
          filteredProducts = filteredProducts.filter((product: Product) => product.userId !== user._id);
        }

        // Shuffle the products array for randomization
        const shuffledProducts = [...filteredProducts].sort(() => 0.5 - Math.random());

        setProducts(shuffledProducts);
        setDisplayedProducts(shuffledProducts.slice(0, visibleProductCount));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?._id]);

  // Show more products
  const handleShowMore = () => {
    const newCount = Math.min(visibleProductCount + 5, products.length);
    setVisibleProductCount(newCount);
    setDisplayedProducts(products.slice(0, newCount));
  };

  // Handle category press
  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/category-products',
      params: { category }
    });
  };

  // Handle product press
  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/payment_details",
      params: {
        productName: product.name,
        productPrice: product.price.toString(),
        quantity: "1",
        size: "Standard",
        color: "Black",
        productId: product._id,
        sellerId: product.userId,
        productImage: product.pics_url && product.pics_url.length > 0 ? product.pics_url[0] : 'https://via.placeholder.com/150'
      }
    });
  };

  // Render stars for ratings
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={`star-half-${i}`} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={`star-outline-${i}`} name="star-outline" size={16} color="#FFD700" />);
      }
    }

    return (
      <View style={styles.ratingContainer}>
        {stars}
        <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <Header />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8A8A8A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Product Name/ Code/ Supplier"
          placeholderTextColor="#8A8A8A"
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#9370DB" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured Discount Banner */}
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{ uri: 'https://via.placeholder.com/600x300/9370DB/FFFFFF' }}
            style={styles.bannerImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
              style={styles.bannerOverlay}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerLeft}>
                  <Text style={styles.bannerTitle}>MEGA SALE</Text>
                  <Text style={styles.bannerSubtitle}>LIMITED TIME OFFER</Text>
                  <TouchableOpacity style={styles.shopNowButton}>
                    <Text style={styles.shopNowText}>SHOP NOW</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>UP TO</Text>
                  <Text style={styles.discountAmount}>40%</Text>
                  <Text style={styles.discountOff}>OFF</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Featured Categories */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Featured Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {exploreCategories.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(item.title)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '20' }]}>
                  <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
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
                <Text style={styles.categoryTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9370DB" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setLoading(true);
                  setError(null);
                  // Re-fetch products
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : displayedProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={48} color="#8A8A8A" />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={displayedProducts}
                numColumns={2}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.productItem}
                    onPress={() => handleProductPress(item)}
                  >
                    <View style={styles.productImageContainer}>
                      <Image
                        source={{
                          uri: item.pics_url && item.pics_url.length > 0
                            ? item.pics_url[0]
                            : 'https://via.placeholder.com/150'
                        }}
                        style={styles.productImage}
                      />
                      <TouchableOpacity style={styles.favoriteButton}>
                        <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.productCategory}>{item.brand}</Text>
                      <Text style={styles.productPrice}>${item.price}</Text>
                      {renderRatingStars(item.ratings)}
                      <Text style={styles.productStock}>
                        {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />

              {/* Show More Button */}
              {displayedProducts.length < products.length && (
                <TouchableOpacity style={styles.showMoreButton} onPress={handleShowMore}>
                  <Text style={styles.showMoreText}>Show More</Text>
                  <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </>
          )}
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
    paddingVertical: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
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
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  bannerLeft: {
    flex: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  shopNowButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#9370DB',
    fontWeight: 'bold',
  },
  discountBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 100,
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    transform: [{ rotate: '10deg' }],
  },
  discountText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  discountAmount: {
    color: '#000000',
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  discountOff: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuredSection: {
    marginVertical: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#9370DB',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesScrollContent: {
    paddingHorizontal: 12,
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  productsSection: {
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#9370DB',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8A8A8A',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  productItem: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    height: 36,
  },
  productCategory: {
    color: '#9370DB',
    fontSize: 12,
    marginBottom: 4,
  },
  productPrice: {
    color: '#9370DB',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#8A8A8A',
  },
  productStock: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  showMoreButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  showMoreText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
});