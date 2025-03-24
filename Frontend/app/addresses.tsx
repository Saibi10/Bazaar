import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native"
import { UserContext } from "./context/userContext"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import axios from "axios"

// Define the Address type based on the MongoDB schema
interface Address {
  _id: string
  userId: string
  type: string
  name: string
  phoneNumber: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

// Form data interface
interface AddressFormData {
  userId: string
  type: string
  name: string
  phoneNumber: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface AddressScreenProps {
  user?: {
    _id: string;
    // Add other user properties if needed
  };
  token?: string;
}

export default function AddressScreen() {
  const insets = useSafeAreaInsets()
  const { user, token } = useLocalSearchParams();
  const router = useRouter()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [addressType, setAddressType] = useState("home")

  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    userId: "",
    type: "home",
    name: "",
    phoneNumber: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  })

  // Fetch addresses when component mounts or when user/token changes
  useEffect(() => {
    if (user && token) {
      fetchAddresses()
    } else {
      setLoading(false)
    }
  }, [userContext])

  // Render a loading state or error message if context is not available
  if (!userContext) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Addresses</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9370DB" />
        </View>
      </View>
    )
  }

  const { user, token } = userContext

  // Fetch addresses from the backend
  const fetchAddresses = async () => {
    if (!token || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/addresses/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setAddresses(response.data)
    } catch (error) {
      console.error("Error fetching addresses:", error)
      Alert.alert("Error", "Failed to load addresses")
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  // Handle address type selection
  const handleAddressTypeChange = (type: string) => {
    setAddressType(type)
    setFormData({
      ...formData,
      type,
    })
  }

  // Submit new address
  const handleSubmit = async () => {
    if (!token || !user) {
      Alert.alert("Error", "You must be logged in to add an address");
      return;
    }

    // Validate required fields
    const requiredFields: (keyof AddressFormData)[] = [
      "name",
      "phoneNumber",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    formData.userId = user._id;

    try {
      setSubmitting(true);

      // Stringify the form data
      const jsonData = JSON.stringify(formData);

      console.log(jsonData)

      // Send the request with the raw JSON data
      await axios.post("http://localhost:5000/addresses", jsonData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Set the content type to JSON
        },
      });

      // Reset form and close modal
      setFormData({
        userId: "",
        type: "home",
        name: "",
        phoneNumber: "",
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        isDefault: false,
      });

      setModalVisible(false);
      fetchAddresses(); // Refresh the address list
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("Error", "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9370DB" />
        </View>
      ) : (
        <>
          {!user ? (
            <View style={styles.emptyContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={50} color="#9370DB" />
              </View>
              <Text style={styles.emptyTitle}>Login Required</Text>
              <Text style={styles.emptySubtitle}>Please login to view and manage your addresses.</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => router.push("/login")}>
                <Text style={styles.addButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={50} color="#9370DB" />
              </View>
              <Text style={styles.emptyTitle}>No Addresses Found</Text>
              <Text style={styles.emptySubtitle}>You haven't added any addresses yet. Add an address to continue.</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.addressListContainer}>
              {addresses.map((address) => (
                <AddressCard key={address._id} address={address} />
              ))}

              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </>
      )}

      {/* Add Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Address Type *</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => {
                        Alert.alert("Select Address Type", "Choose the type of address", [
                        { text: "Home", onPress: () => handleAddressTypeChange("home") },
                        { text: "Work", onPress: () => handleAddressTypeChange("work") },
                        { text: "Other", onPress: () => handleAddressTypeChange("other") },
                        { text: "Cancel", style: "cancel" },
                        ]);
                    }}
                    >
                    <Text style={styles.inputText}>
                        {addressType === "home"
                        ? "Home"
                        : addressType === "work"
                        ? "Work"
                        : addressType === "other"
                        ? "Other"
                        : "Select Address Type"} {/* Fallback text */}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9370DB" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#666666"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#666666"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange("phoneNumber", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 1 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Street address, P.O. box"
                  placeholderTextColor="#666666"
                  value={formData.addressLine1}
                  onChangeText={(text) => handleInputChange("addressLine1", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city"
                  placeholderTextColor="#666666"
                  value={formData.city}
                  onChangeText={(text) => handleInputChange("city", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>State/Province *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter state or province"
                  placeholderTextColor="#666666"
                  value={formData.state}
                  onChangeText={(text) => handleInputChange("state", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Postal Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter postal code"
                  placeholderTextColor="#666666"
                  keyboardType="number-pad"
                  value={formData.postalCode}
                  onChangeText={(text) => handleInputChange("postalCode", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Country *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter country"
                  placeholderTextColor="#666666"
                  value={formData.country}
                  onChangeText={(text) => handleInputChange("country", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}
                    onPress={() => handleInputChange("isDefault", !formData.isDefault)}
                  >
                    {formData.isDefault && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>Set as default address</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// Address Card Component
function AddressCard({ address }: { address: Address }) {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <Text style={styles.addressType}>{address.type.toUpperCase()}</Text>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressName}>{address.name}</Text>
      <Text style={styles.addressDetail}>{address.addressLine1}</Text>
      <Text style={styles.addressDetail}>{`${address.city}, ${address.state} ${address.postalCode}`}</Text>
      <Text style={styles.addressDetail}>{address.country}</Text>
      <Text style={styles.addressPhone}>{address.phoneNumber}</Text>

      <View style={styles.addressActions}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={16} color="#9370DB" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#8A8A8A",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    maxWidth: 300,
    alignSelf: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  addressListContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  addressCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addressTypeContainer: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addressType: {
    color: "#9370DB",
    fontWeight: "bold",
    fontSize: 12,
  },
  defaultBadge: {
    backgroundColor: "#9370DB20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: "#9370DB",
    fontWeight: "bold",
    fontSize: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  addressDetail: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: 8,
  },
  addressActions: {
    flexDirection: "row",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  editButtonText: {
    color: "#9370DB",
    marginLeft: 4,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FF3B30",
    marginLeft: 4,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#121212",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9370DB",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#9370DB",
  },
  checkboxLabel: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
})