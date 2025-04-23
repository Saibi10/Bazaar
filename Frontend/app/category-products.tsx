"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native"
import axios from "axios"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"

// Define the Product type based on the MongoDB model
interface Product {
  _id: string
  userId: string
  name: string
  pics_url: string[]
  category: string[]
  price: number
  description: string
  stock: number
  brand: string
  ratings: number
  reviews: {
    user: string
    comment: string
    rating: number
  }[]
  createdAt: string
  updatedAt: string
}

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
}

// Color options
const colorOptions = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Purple", "Gray"]

const CategoryProductsScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { category } = useLocalSearchParams()
  const screenWidth = Dimensions.get("window").width

  // States
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Use axios.get to fetch products
        const response = await axios.get("http://localhost:5000/products");

        // Filter products by category if a category is specified
        const filteredProducts = category
          ? response.data.filter((product: Product) =>
            product.category.includes(category as string)
          )
          : response.data;

        setProducts(filteredProducts);
      } catch (err) {
        // Handle errors
        setError(
          err instanceof Error ? err.message : "An error occurred while fetching products"
        );
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Handle product selection
  const handleProductPress = (product: Product) => {
    setSelectedProduct(product)
    setCurrentImageIndex(0)
    // Set default size based on category
    if (product.category.length > 0) {
      const primaryCategory = product.category[0]
      const sizes = sizeOptions[primaryCategory as keyof typeof sizeOptions] || sizeOptions.other
      setSelectedSize(sizes[0])
    } else {
      setSelectedSize(sizeOptions.other[0])
    }
    setSelectedColor(colorOptions[0])
    setIsModalVisible(true)
  }

  // Handle image navigation
  const nextImage = () => {
    if (selectedProduct && currentImageIndex < selectedProduct.pics_url.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // Handle buy button press
  const handleBuy = () => {
    if (selectedProduct) {
      if (Number.parseInt(quantity) > selectedProduct.stock) {
        alert(`Only ${selectedProduct.stock} items are available in stock!`)
        return
      }

      // Navigate to payment details page with product information
      router.push({
        pathname: "/payment_details",
        params: {
          productName: selectedProduct.name,
          productPrice: selectedProduct.price.toString(),
          quantity: quantity,
          size: selectedSize,
          color: selectedColor,
          productId: selectedProduct._id,
        },
      })

      setIsModalVisible(false)
      setSelectedProduct(null)
      setQuantity("1")
    }
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (selectedProduct) {
      if (Number.parseInt(quantity) > selectedProduct.stock) {
        alert(`Only ${selectedProduct.stock} items are available in stock!`)
        return
      }
      alert(`Added ${quantity} ${selectedProduct.name}(s) to cart!\nSize: ${selectedSize}, Color: ${selectedColor}`)
    }
  }

  // Render stars for ratings
  const renderRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={`star-half-${i}`} name="star-half" size={16} color="#FFD700" />)
      } else {
        stars.push(<Ionicons key={`star-outline-${i}`} name="star-outline" size={16} color="#FFD700" />)
      }
    }

    return (
      <View style={styles.ratingContainer}>
        {stars}
        <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#9370DB" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category || "All Products"}</Text>
        <TouchableOpacity>
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={64} color="#8A8A8A" />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productItem} onPress={() => handleProductPress(item)}>
              <Image
                source={{
                  uri: item.pics_url && item.pics_url.length > 0 ? item.pics_url[0] : "https://via.placeholder.com/150",
                }}
                style={styles.productImage}
              />
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.productBrand}>{item.brand}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              {renderRatingStars(item.ratings)}
              <Text style={styles.productStock}>{item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}</Text>
            </TouchableOpacity>
          )}
        />
      )}

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
                  {selectedProduct?.stock > 0 ? `${selectedProduct.stock} in stock` : "Out of stock"}
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
                        ? sizeOptions[selectedProduct.category[0] as keyof typeof sizeOptions] || sizeOptions.other
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
                    const numericValue = text.replace(/[^0-9]/g, "")
                    // Prevent empty input by defaulting to "1"
                    setQuantity(numericValue === "" ? "1" : numericValue)
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
                    <Text style={styles.buttonText}>{selectedProduct?.stock > 0 ? "Buy Now" : "Out of Stock"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#9370DB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8A8A8A",
    textAlign: "center",
  },
  productList: {
    padding: 16,
  },
  productItem: {
    flex: 1,
    margin: 8,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: "#9370DB",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9370DB",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#8A8A8A",
  },
  productStock: {
    fontSize: 12,
    color: "#8A8A8A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  imageCarouselContainer: {
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingBottom: 16,
  },
  modalProductImage: {
    height: 300,
    borderRadius: 8,
  },
  imageNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  navButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  navButtonDisabled: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  imageCounter: {
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  thumbnailContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  thumbnailWrapper: {
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 6,
  },
  activeThumbnail: {
    borderColor: "#9370DB",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  productDetails: {
    padding: 16,
  },
  priceRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalProductPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9370DB",
  },
  modalProductBrand: {
    fontSize: 16,
    color: "#9370DB",
    marginBottom: 8,
  },
  modalProductStock: {
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    marginTop: 16,
  },
  modalProductDescription: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#444444",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedOption: {
    borderColor: "#9370DB",
    backgroundColor: "rgba(147, 112, 219, 0.2)",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  selectedOptionText: {
    color: "#9370DB",
    fontWeight: "bold",
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444444",
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  quantityInput: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  addToCartButton: {
    backgroundColor: "#444444",
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buyButton: {
    backgroundColor: "#9370DB",
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#555555",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
})

export default CategoryProductsScreen

