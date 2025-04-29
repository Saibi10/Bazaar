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
  Modal,
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

// Size options based on category
const sizeOptions = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  fashion: ["XS", "S", "M", "L", "XL", "XXL"],
  style: ["XS", "S", "M", "L", "XL", "XXL"],
  beauty: ["Small", "Medium", "Large"],
  electronics: ["Standard"],
  home: ["Small", "Medium", "Large"],
  sports: ["XS", "S", "M", "L", "XL", "XXL"],
  other: ["One Size"],
};

// Color options
const colorOptions = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Purple", "Gray"];

// Add this type guard function
const isProductValid = (product: Product | null): product is Product => {
  return product !== null && typeof product.stock === 'number';
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const context = useContext(UserContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleProductCount, setVisibleProductCount] = useState(10);
  const screenWidth = Dimensions.get("window").width;

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

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
        const URL = process.env.EXPO_PUBLIC_APIBASE_URL;
        const response = await axios.get(`${URL}/products`);

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

  // Handle product press to show modal
  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    // Set default size based on category
    if (product.category.length > 0) {
      const primaryCategory = product.category[0].toLowerCase();
      const sizes = sizeOptions[primaryCategory as keyof typeof sizeOptions] || sizeOptions.other;
      setSelectedSize(sizes[0]);
    } else {
      setSelectedSize(sizeOptions.other[0]);
    }
    setSelectedColor(colorOptions[0]);
    setQuantity("1");
    setIsModalVisible(true);
  };

  // Handle buy button press in modal
  const handleBuy = () => {
    if (isProductValid(selectedProduct)) {
      if (Number.parseInt(quantity) > selectedProduct.stock) {
        alert(`Only ${selectedProduct.stock} items are available in stock!`);
        return;
      }

      // Navigate to payment details page with all required product information
      router.push({
        pathname: "/payment_details",
        params: {
          productName: selectedProduct.name,
          productPrice: selectedProduct.price.toString(),
          quantity: quantity,
          size: selectedSize,
          color: selectedColor,
          productId: selectedProduct._id,
          sellerId: selectedProduct.userId,
          productImage: selectedProduct.pics_url && selectedProduct.pics_url.length > 0
            ? selectedProduct.pics_url[0]
            : 'https://via.placeholder.com/150'
        }
      });

      setIsModalVisible(false);
      setSelectedProduct(null);
      setQuantity("1");
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (selectedProduct) {
      if (Number.parseInt(quantity) > selectedProduct.stock) {
        alert(`Only ${selectedProduct.stock} items are available in stock!`);
        return;
      }
      alert(`Added ${quantity} ${selectedProduct.name}(s) to cart!\nSize: ${selectedSize}, Color: ${selectedColor}`);
    }
  };

  // Handle image navigation
  const nextImage = () => {
    if (selectedProduct && currentImageIndex < selectedProduct.pics_url.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
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

      {/* Product Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedProduct?.name}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Image Carousel */}
              <View style={styles.imageCarouselContainer}>
                <Image
                  source={{
                    uri:
                      selectedProduct?.pics_url && selectedProduct.pics_url.length > 0
                        ? selectedProduct.pics_url[currentImageIndex]
                        : "https://via.placeholder.com/300",
                  }}
                  style={[styles.modalProductImage, { width: screenWidth * 0.8 }]}
                  resizeMode="cover"
                />

                {/* Image Navigation Buttons */}
                {selectedProduct && selectedProduct.pics_url && selectedProduct.pics_url.length > 1 && (
                  <View style={styles.imageNavigation}>
                    <TouchableOpacity
                      style={[styles.navButton, currentImageIndex === 0 && styles.navButtonDisabled]}
                      onPress={prevImage}
                      disabled={currentImageIndex === 0}
                    >
                      <Ionicons name="chevron-back" size={24} color={currentImageIndex === 0 ? "#555555" : "#FFFFFF"} />
                    </TouchableOpacity>
                    <Text style={styles.imageCounter}>
                      {currentImageIndex + 1}/{selectedProduct.pics_url.length}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.navButton,
                        currentImageIndex === selectedProduct.pics_url.length - 1 && styles.navButtonDisabled,
                      ]}
                      onPress={nextImage}
                      disabled={currentImageIndex === selectedProduct.pics_url.length - 1}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={currentImageIndex === selectedProduct.pics_url.length - 1 ? "#555555" : "#FFFFFF"}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Thumbnail Preview */}
                {selectedProduct && selectedProduct.pics_url && selectedProduct.pics_url.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
                    {selectedProduct.pics_url.map((url, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setCurrentImageIndex(index)}
                        style={[styles.thumbnailWrapper, currentImageIndex === index && styles.activeThumbnail]}
                      >
                        <Image source={{ uri: url }} style={styles.thumbnail} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Product Details */}
              <View style={styles.productDetails}>
                <View style={styles.priceRatingRow}>
                  <Text style={styles.modalProductPrice}>${selectedProduct?.price}</Text>
                  {selectedProduct && renderRatingStars(selectedProduct.ratings)}
                </View>

                <Text style={styles.modalProductBrand}>{selectedProduct?.brand}</Text>

                <Text style={styles.modalProductStock}>
                  {isProductValid(selectedProduct) ? `${selectedProduct.stock} in stock` : "Out of stock"}
                </Text>

                {/* Product Description */}
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.modalProductDescription}>
                  {selectedProduct?.description || "No description available."}
                </Text>

                {/* Size Selection */}
                {selectedProduct && (
                  <>
                    <Text style={styles.sectionTitle}>Size</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                      {(selectedProduct.category.length > 0
                        ? sizeOptions[selectedProduct.category[0].toLowerCase() as keyof typeof sizeOptions] || sizeOptions.other
                        : sizeOptions.other
                      ).map((size) => (
                        <TouchableOpacity
                          key={size}
                          style={[styles.optionButton, selectedSize === size && styles.selectedOption]}
                          onPress={() => setSelectedSize(size)}
                        >
                          <Text style={[styles.optionText, selectedSize === size && styles.selectedOptionText]}>
                            {size}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Color Selection */}
                    <Text style={styles.sectionTitle}>Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                      {colorOptions.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color.toLowerCase() },
                            selectedColor === color && styles.selectedColorOption,
                          ]}
                          onPress={() => setSelectedColor(color)}
                        >
                          {selectedColor === color && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={["White", "Yellow"].includes(color) ? "#000" : "#FFF"}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                {/* Quantity Input */}
                <Text style={styles.sectionTitle}>Quantity</Text>
                <TextInput
                  style={styles.quantityInput}
                  placeholder="Quantity"
                  placeholderTextColor="#8A8A8A"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={(text) => {
                    // Only allow numbers
                    const numericValue = text.replace(/[^0-9]/g, "");
                    // Prevent empty input by defaulting to "1"
                    setQuantity(numericValue === "" ? "1" : numericValue);
                  }}
                />

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.addToCartButton, selectedProduct?.stock === 0 && styles.buttonDisabled]}
                    onPress={handleAddToCart}
                    disabled={selectedProduct?.stock === 0}
                  >
                    <Ionicons name="cart" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Add to Cart</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.buyButton, selectedProduct?.stock === 0 && styles.buttonDisabled]}
                    onPress={handleBuy}
                    disabled={selectedProduct?.stock === 0}
                  >
                    <Text style={styles.buttonText}>
                      {isProductValid(selectedProduct) ? (selectedProduct.stock > 0 ? "Buy Now" : "Out of Stock") : "Out of Stock"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  imageCarouselContainer: {
    alignItems: 'center',
    backgroundColor: '#121212',
    position: 'relative',
  },
  modalProductImage: {
    height: 250,
    borderRadius: 8,
  },
  imageNavigation: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  imageCounter: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 12,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginHorizontal: 4,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#9370DB',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  productDetails: {
    padding: 16,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalProductPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9370DB',
  },
  modalProductBrand: {
    fontSize: 14,
    color: '#9370DB',
    marginBottom: 4,
  },
  modalProductStock: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 16,
  },
  modalProductDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
    marginRight: 8,
  },
  selectedOption: {
    borderColor: '#9370DB',
    backgroundColor: 'rgba(147, 112, 219, 0.1)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#9370DB',
    fontWeight: 'bold',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  quantityInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
  },
  buyButton: {
    backgroundColor: '#9370DB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});