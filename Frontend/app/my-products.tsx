"use client"

import { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native"
import { UserContext } from "./context/userContext"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"

const API_URL = "http://localhost:5000/products"

const MyProductsScreen = () => {
  const router = useRouter()
  const userContext = useContext(UserContext)

  if (!userContext) {
    console.error("UserContext is undefined. Make sure the provider is properly set up.");
    return null; // Or show a loading spinner
  }

  const { user, token } = userContext
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showImageUploader, setShowImageUploader] = useState(true); // Set this based on your condition
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])

  // Product form state
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [category, setCategory] = useState("")
  const [brand, setBrand] = useState("")
  const [images, setImages] = useState<string[]>([]) // Store multiple image URIs

  // Check if user is authenticated
  const isAuthenticated = userContext && userContext.user && userContext.token

  // Fetch products when component mounts or when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
    } else {
      setLoadingProducts(false)
    }
  }, [isAuthenticated])

  // Request permission to access the camera and photo library
  useEffect(() => {
    ; (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!")
      }
    })()
  }, [])

  // Fetch products from the API
  const fetchProducts = async () => {
    if (!userContext || !userContext.token) return

    setLoadingProducts(true)
    try {
      const response = await axios.get(`${API_URL}/user/${user._id}`, {
        headers: {
          Authorization: `Bearer ${userContext.token}`,
        },
      })
      setProducts(response.data)
    } catch (err) {
      console.error("Error fetching products:", err)
      Alert.alert("Error", "Failed to load products. Please try again.")
    } finally {
      setLoadingProducts(false)
    }
  }

  // Function to pick multiple images from the device
  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can only upload up to 5 images.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true, // Enable multiple selection
    })

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri) // Get URIs of all selected images
      const remainingSlots = 5 - images.length // Calculate remaining slots
      const newImages = selectedImages.slice(0, remainingSlots) // Limit to remaining slots
      setImages([...images, ...newImages]) // Add new images to the array
    }
  }

  // Function to remove an image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
  }

  // Function to handle login redirect with gesture
  const handleLoginRedirect = () => {
    Alert.alert("Authentication Required", "You need to login to manage your products.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Login",
        onPress: () => router.push("/login"),
      },
    ])
  }

  // Function to create a form data object from an image URI
  const uriToFormData = async (uri: string, index: number) => {
    const uriParts = uri.split("/");
    const fileName = uriParts[uriParts.length - 1];
    const fileExtension = fileName.split(".").pop();

    const response = await fetch(uri);
    const blob = await response.blob();

    return {
      uri,
      name: `image_${index}.${fileExtension}`,
      type: `image/${fileExtension}`,
    };
  };

  const handleAddProduct = async () => {
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }

    if (editingProductId == null) {
      setShowImageUploader(true);
      if (!productName || !productDescription || !price || !quantity || !category || !brand || images.length === 0) {
        setError("Please fill all required fields and add at least one image");
        return;
      }

      setLoading(true);
      try {
        const formData = new FormData();

        // Add text fields
        formData.append("userId", user._id);
        formData.append("name", productName);
        formData.append("category", category);
        formData.append("price", price);
        formData.append("description", productDescription);
        formData.append("stock", quantity);
        formData.append("brand", brand);

        // Add images to FormData as files
        for (let i = 0; i < images.length; i++) {
          const imageFile = await uriToFormData(images[i], i);
          formData.append("images", imageFile as any); // Append each image file with the same key
        }

        // Log FormData for debugging
        for (const [key, value] of formData.entries()) {
          console.log(key, value);
        }

        // Send the FormData to the server
        const response = await axios.post(`${API_URL}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userContext?.token}`,
          },
        });

        console.log("Server response:", response.data); // Debugging

        await fetchProducts();
        setModalVisible(false);
        clearForm();
      } catch (err) {
        console.error("Error adding product:", err);
        setError("Failed to add product. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Edit existing product logic (unchanged)
      if (!productName || !productDescription || !price || !quantity || !category || !brand) {
        setError("Please fill all required fields");
        return;
      }

      setLoading(true);
      try {
        const requestBody = {
          name: productName,
          category: category,
          price: price,
          description: productDescription,
          stock: quantity,
          brand: brand,
        };

        console.log("Request Body:", requestBody); // Debugging

        const response = await axios.put(`${API_URL}/${editingProductId}`, requestBody, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userContext?.token}`,
          },
        });

        console.log("Server response:", response.data); // Debugging

        await fetchProducts();
        setModalVisible(false);
        clearForm();
      } catch (err) {
        console.error("Error updating product:", err);
        setError("Failed to update product. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditProduct = async (productId: string) => {
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }

    setLoading(true);
    try {
      // Fetch the product details to populate the form
      const response = await axios.get(`${API_URL}/${productId}`, {
        headers: {
          Authorization: `Bearer ${userContext?.token}`,
        },
      });

      const product = response.data;

      // Populate the form fields with the product data
      setProductName(product.name);
      setProductDescription(product.description);
      setPrice(product.price.toString());
      setQuantity(product.stock.toString());
      setCategory(product.category);
      setBrand(product.brand);

      // Open the modal for editing
      setModalVisible(true);
      // Store the product ID for updating
      setEditingProductId(productId);
      setShowImageUploader(false)
    } catch (err) {
      console.error("Error fetching product details:", err);
      Alert.alert("Error", "Failed to fetch product details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }

    console.log("Deleting product:", productId);

    // Show confirmation dialog
    try {
      console.log("Sending DELETE request to:", `${API_URL}/${productId}`);

      const response = await axios.delete(`${API_URL}/${productId}`, {
        headers: {
          Authorization: `Bearer ${userContext?.token}`,
        },
      });

      console.log("Delete response:", response.data);

      if (response.status === 200 || response.status === 204) {
        // Refresh the product list
        await fetchProducts();
        Alert.alert("Success", "Product deleted successfully.");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      Alert.alert("Error", "Failed to delete product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setProductName("");
    setProductDescription("");
    setPrice("");
    setQuantity("");
    setCategory("");
    setBrand("");
    setImages([]);
    setError(null);
    setEditingProductId(null); // Reset editing state
  };

  // Render login prompt if user is not authenticated
  if (!isAuthenticated && !loadingProducts) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Products</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={60} color="#9370DB" />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyText}>Please login to manage your products</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/login")}>
            <Text style={styles.addButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Products</Text>
        </View>

        {loadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9370DB" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={60} color="#9370DB" />
            <Text style={styles.emptyTitle}>No products added</Text>
            <Text style={styles.emptyText}>You haven't added any products yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setModalVisible(true);
                setShowImageUploader(true);
                clearForm();
              }}
            >
              <Text style={styles.addButtonText}>Add New Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                {product.images && product.images.length > 0 && (
                  <Image source={{ uri: product.images[0] }} style={styles.productImage} resizeMode="cover" />
                )}
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>${product.price}</Text>
                  <Text style={styles.productQuantity}>Stock: {product.quantity}</Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditProduct(product._id)} // Assuming product._id is the unique identifier
                  >
                    <Ionicons name="create-outline" size={16} color="#9370DB" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProduct(product._id)} // Assuming product._id is the unique identifier
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => {
                setModalVisible(true); // Open the modal
                setShowImageUploader(true); // Show the image uploader
                clearForm();
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingProductId ? "Edit Product" : "Add Product"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                {error && <Text style={styles.errorText}>{error}</Text>}

                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  value={productName}
                  onChangeText={setProductName}
                  placeholder="Enter product name"
                  placeholderTextColor="#666"
                />

                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={productDescription}
                  onChangeText={setProductDescription}
                  placeholder="Enter product description"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Enter price"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="Enter quantity"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Category *</Text>
                <TextInput
                  style={styles.input}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Enter category"
                  placeholderTextColor="#666"
                />

                <Text style={styles.inputLabel}>Brand *</Text>
                <TextInput
                  style={styles.input}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Enter brand"
                  placeholderTextColor="#666"
                />

                {showImageUploader && (
                  <>
                    <Text style={styles.inputLabel}>Images * (Max 5)</Text>
                    <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
                      <Ionicons name="image-outline" size={20} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.imagePickerButtonText}>Upload Images</Text>
                    </TouchableOpacity>
                    <View style={styles.imageList}>
                      {images.map((uri, index) => (
                        <View key={index} style={styles.imageContainer}>
                          <Image source={{ uri }} style={styles.selectedImage} />
                          <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                            <Ionicons name="close" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleAddProduct} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Product</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  addButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  productsContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for floating button
  },
  productItem: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 180,
  },
  productName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    padding: 12,
    paddingBottom: 4,
  },
  productBrand: {
    color: "#9370DB",
    fontSize: 14,
    paddingHorizontal: 12,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  productPrice: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  productQuantity: {
    color: "#ccc",
    fontSize: 14,
  },
  productActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#333",
    padding: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  editButtonText: {
    color: "#9370DB",
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FF3B30",
    marginLeft: 4,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#9370DB",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%", // Increased modal height
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputLabel: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
  },
  textArea: {
    minHeight: 100,
  },
  buttonIcon: {
    marginRight: 8,
  },
  imagePickerButton: {
    backgroundColor: "#9370DB",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  imagePickerButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  imageList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  imageContainer: {
    position: "relative",
    margin: 4,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 4,
  },
  saveButton: {
    backgroundColor: "#9370DB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 12,
  },
})

export default MyProductsScreen

