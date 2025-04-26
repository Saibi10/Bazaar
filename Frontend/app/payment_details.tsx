"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"

// Define notification type
interface NotificationType {
  message: string
  type: "success" | "error"
}

export default function PaymentDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()

  // Get product details from URL params
  const productName = (params.productName as string) || "Product"
  const productPrice = (params.productPrice as string) || "0"
  const productQuantity = (params.quantity as string) || "1"
  const productSize = (params.size as string) || "Standard"
  const productColor = (params.color as string) || "Black"

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("paypal")

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate total
  const subtotal = Number.parseFloat(productPrice) * Number.parseInt(productQuantity)
  const shipping = 10.0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  // Animation values for notification
  const notificationAnim = useState(new Animated.Value(-100))[0]

  // Notification state with proper typing
  const [notification, setNotification] = useState<NotificationType | null>(null)

  // Handle input change
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Show notification function with proper type annotations
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    // Set notification content
    setNotification({ message, type })

    // Reset animation value
    notificationAnim.setValue(-100)

    // Animate notification sliding in
    Animated.spring(notificationAnim, {
      toValue: 0,
      tension: 70,
      friction: 12,
      useNativeDriver: true,
    }).start()

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      // Animate notification sliding out
      Animated.timing(notificationAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setNotification(null)
      })
    }, 3000)
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Set processing state
    setIsProcessing(true)

    try {
      // Check if user is authenticated
      const userStr = await AsyncStorage.getItem('user')
      const token = await AsyncStorage.getItem('token')
      
      if (!userStr || !token) {
        showNotification("Please login to complete your purchase", "error")
        setIsProcessing(false)
        return
      }

      let user;
      try {
        user = JSON.parse(userStr)
        console.log("User data:", user)
      } catch (parseError) {
        console.error("Error parsing user data:", parseError)
        showNotification("Error with user data. Please login again.", "error")
        setIsProcessing(false)
        return
      }

      if (!user || !user._id) {
        showNotification("Invalid user data. Please login again.", "error")
        setIsProcessing(false)
        return
      }

      // Clean the user ID to ensure it's properly formatted
      const cleanUserId = user._id.trim()

      // Fetch user's addresses using axios
      try {
        const URL = process.env.EXPO_PUBLIC_APIBASE_URL || 'http://localhost:5000/api';
        console.log("Fetching addresses from:", `${URL}/addresses/${cleanUserId}`)

        const addressResponse = await axios.get(`${URL}/addresses/${cleanUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        console.log("Address response:", addressResponse.data)

        const addresses = addressResponse.data
        if (!Array.isArray(addresses) || addresses.length === 0) {
          showNotification("No shipping addresses found. Please add an address first.", "error")
          setIsProcessing(false)
          return
        }

        const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
        console.log("Selected shipping address:", defaultAddress)

        if (!defaultAddress || !defaultAddress._id) {
          showNotification("Invalid shipping address. Please add a valid address.", "error")
          setIsProcessing(false)
          return
        }

        // Validate required order fields
        if (!cleanUserId || !params.sellerId || !params.productId || !defaultAddress._id) {
          console.error("Missing required fields:", {
            buyer: cleanUserId,
            seller: params.sellerId,
            productId: params.productId,
            shippingAddress: defaultAddress._id
          })
          showNotification("Missing required order information.", "error")
          setIsProcessing(false)
          return
        }

        // Create order with the address
        const orderData = {
          buyerId: cleanUserId,
          sellerId: params.sellerId,
          items: [{
            product: params.productId,
            quantity: parseInt(productQuantity) || 1,
            price: parseFloat(productPrice) || 0
          }],
          totalAmount: parseFloat(total.toFixed(2)),
          status: 'IN_PROGRESS',
          paymentStatus: 'PAID',
          shippingAddressId: defaultAddress._id
        }

        console.log("Submitting order with data:", orderData)

        // Make API call to create order using axios
        const orderResponse = await axios.post(`${URL}/orders`, orderData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!orderResponse.data) {
          throw new Error("No response data from order creation")
        }

        console.log("Order created successfully:", orderResponse.data)

        // Show success notification
        showNotification("Payment successful! Thank you for your purchase.")

        // Navigate back to home after a delay
        setTimeout(() => {
          router.push("/")
        }, 3500)

      } catch (error) {
        console.error('Error:', error)
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || error.message
          console.error('Axios error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: errorMessage
          })
          showNotification(errorMessage || "Error processing your order. Please try again.", "error")
        } else {
          console.error('Unexpected error:', error)
          showNotification("An unexpected error occurred. Please try again.", "error")
        }
        setIsProcessing(false)
      }

    } catch (error) {
      console.error('Error in handleSubmit:', error)
      showNotification("Payment failed. Please try again.", "error")
      setIsProcessing(false)
    }
  }

  // Handle payment method selection
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Main content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Payment form */}
          <View style={styles.formContainer}>
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={20} color="#9370DB" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) => handleChange("fullName", text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                />
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card" size={20} color="#9370DB" />
                <Text style={styles.sectionTitle}>Payment Method</Text>
              </View>

              {/* PayPal Option */}
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === "paypal" && styles.paymentOptionSelected]}
                onPress={() => handlePaymentMethodChange("paypal")}
              >
                <View style={styles.paymentOptionLeft}>
                  <View style={styles.radioButton}>
                    {paymentMethod === "paypal" && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.paymentOptionText}>PayPal</Text>
                </View>
                <View style={styles.paymentLogo} />
              </TouchableOpacity>

              {/* Credit Card Option */}
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === "credit-card" && styles.paymentOptionSelected]}
                onPress={() => handlePaymentMethodChange("credit-card")}
              >
                <View style={styles.paymentOptionLeft}>
                  <View style={styles.radioButton}>
                    {paymentMethod === "credit-card" && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.paymentOptionText}>Credit card</Text>
                </View>
                <View style={styles.paymentCards}>
                  <View style={styles.paymentCard} />
                  <Image 
                    source={require('../assets/images/paypal.png')} 
                    style={styles.cardImage} 
                    resizeMode="contain" 
                  />
                  <View style={styles.paymentCard} />
                  <View style={styles.paymentCard} />
                </View>
              </TouchableOpacity>

              {/* Klarna Option */}
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === "klarna" && styles.paymentOptionSelected]}
                onPress={() => handlePaymentMethodChange("klarna")}
              >
                <View style={styles.paymentOptionLeft}>
                  <View style={styles.radioButton}>
                    {paymentMethod === "klarna" && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.paymentOptionText}>Buy now, pay later with Klarna</Text>
                </View>
                <View style={styles.paymentLogo} />
              </TouchableOpacity>

              {/* Credit Card Details */}
              {paymentMethod === "credit-card" && (
                <View style={styles.cardDetails}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Card Number</Text>
                    <View style={styles.inputWithIcon}>
                      <Ionicons name="card" size={18} color="#8A8A8A" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { paddingLeft: 40 }]}
                        placeholder="1234 5678 9012 3456"
                        placeholderTextColor="#8A8A8A"
                        keyboardType="numeric"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChangeText={(text) => handleChange("cardNumber", text)}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Card Holder</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor="#8A8A8A"
                      value={formData.cardHolder}
                      onChangeText={(text) => handleChange("cardHolder", text)}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.label}>Expiry Date</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="MM/YY"
                        placeholderTextColor="#8A8A8A"
                        maxLength={5}
                        value={formData.expiryDate}
                        onChangeText={(text) => handleChange("expiryDate", text)}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.label}>CVV</Text>
                      <View style={styles.inputWithIcon}>
                        <Ionicons name="lock-closed" size={16} color="#8A8A8A" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { paddingLeft: 40 }]}
                          placeholder="123"
                          placeholderTextColor="#8A8A8A"
                          keyboardType="numeric"
                          maxLength={4}
                          value={formData.cvv}
                          onChangeText={(text) => handleChange("cvv", text)}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cart" size={20} color="#9370DB" />
                <Text style={styles.sectionTitle}>Order Summary</Text>
              </View>

              <View style={styles.productSummary}>
                <View style={styles.productImageContainer}>
                  <Image 
                    source={{ uri: typeof params.productImage === 'string' ? params.productImage : 'https://via.placeholder.com/150' }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{productName}</Text>
                  <Text style={styles.productMeta}>
                    Size: {productSize} • Color: {productColor}
                  </Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productQuantityPrice}>
                      ${productPrice} × {productQuantity}
                    </Text>
                    <Text style={styles.productTotalPrice}>${subtotal.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.buyButton, isProcessing && styles.buyButtonDisabled]}
              onPress={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.buyButtonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.buyButtonText}>Buy Now</Text>
              )}
            </TouchableOpacity>

            <View style={styles.secureInfo}>
              <Ionicons name="lock-closed" size={14} color="#8A8A8A" />
              <Text style={styles.secureInfoText}>All transactions are secure and encrypted.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Notification */}
      {notification && (
        <Animated.View
          style={[
            styles.notification,
            notification.type === "error" ? styles.errorNotification : styles.successNotification,
            { transform: [{ translateY: notificationAnim }] },
          ]}
        >
          <View style={styles.notificationContent}>
            <Ionicons
              name={notification.type === "error" ? "alert-circle" : "checkmark-circle"}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.notificationText}>{notification.message}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Animated.timing(notificationAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                setNotification(null)
              })
            }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  formContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#444444",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },
  inputWithIcon: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 14,
    zIndex: 1,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: "#9370DB",
    backgroundColor: "rgba(147, 112, 219, 0.1)",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9370DB",
  },
  paymentOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  paymentCards: {
    flexDirection: "row",
  },
  paymentCard: {
    width: 36,
    height: 24,
    backgroundColor: "#444444",
    borderRadius: 4,
    marginLeft: 4,
  },
  cardImage: {
    width: 36,
    height: 24,
  },
  paymentLogo: {
    width: 60,
    height: 24,
    backgroundColor: "#444444",
    borderRadius: 4,
  },
  cardDetails: {
    marginTop: 8,
  },
  productSummary: {
    flexDirection: "row",
    marginBottom: 16,
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productQuantityPrice: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  productTotalPrice: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  summaryValue: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9370DB",
  },
  buyButton: {
    backgroundColor: "#9370DB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  buyButtonDisabled: {
    backgroundColor: "#6b5099",
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  secureInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  secureInfoText: {
    fontSize: 12,
    color: "#8A8A8A",
    marginLeft: 4,
  },
  notification: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  successNotification: {
    backgroundColor: "#4CAF50", // Green
  },
  errorNotification: {
    backgroundColor: "#F44336", // Red
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
})
