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
  Switch,
} from "react-native"
import { UserContext } from "./context/userContext"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"

const API_URL = `${process.env.EXPO_PUBLIC_APIBASE_URL}/users`;

const SettingsScreen = () => {
  const router = useRouter()
  const userContext = useContext(UserContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)

  // User settings state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [shopName, setShopName] = useState("")
  const [shopDescription, setShopDescription] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  // Check if user is authenticated
  const isAuthenticated = userContext && userContext.user && userContext.token

  // Fetch user data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated])

  // Request permission to access the camera and photo library
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need access to your photos to update your profile picture.")
      }
    })()
  }, [])

  const fetchUserData = async () => {
    if (!userContext || !userContext.token || !userContext.user) return

    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/${userContext.user._id}`, {
        headers: {
          Authorization: `Bearer ${userContext.token}`,
        },
      })

      const userData = response.data
      setName(userData.name || "")
      setEmail(userData.email || "")
      setPhone(userData.phone || "")
      setBio(userData.bio || "")
      setShopName(userData.shopName || "")
      setShopDescription(userData.shopDescription || "")
      setAvatar(userData.avatar || null)
      setNotificationsEnabled(userData.notificationsEnabled !== false)
      setDarkMode(userData.darkMode !== false)
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Failed to load user data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri)
    }
  }

  const handleUpdateProfile = async () => {
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "You need to login to update your profile.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()

      // Add text fields
      formData.append("name", name)
      formData.append("email", email)
      formData.append("phone", phone)
      formData.append("bio", bio)
      formData.append("shopName", shopName)
      formData.append("shopDescription", shopDescription)
      formData.append("notificationsEnabled", notificationsEnabled.toString())
      formData.append("darkMode", darkMode.toString())

      // Add avatar if selected
      if (avatar) {
        const uriParts = avatar.split("/")
        const fileName = uriParts[uriParts.length - 1]
        const fileExtension = fileName.split(".").pop()

        const response = await fetch(avatar)
        const blob = await response.blob()

        formData.append("avatar", {
          uri: avatar,
          name: `avatar.${fileExtension}`,
          type: `image/${fileExtension}`,
        } as any)
      }

      const response = await axios.put(`${API_URL}/${userContext.user._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userContext.token}`,
        },
      })

      setSuccess("Profile updated successfully!")
      if (userContext.setUser) {
        userContext.setUser(response.data)
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          if (userContext.logout) {
            userContext.logout()
          }
          router.replace("/login")
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This will permanently delete your account and all your data. Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/${userContext.user._id}`, {
              headers: {
                Authorization: `Bearer ${userContext.token}`,
              },
            })

            if (userContext.logout) {
              userContext.logout()
            }
            router.replace("/login")
          } catch (err) {
            console.error("Error deleting account:", err)
            setError("Failed to delete account. Please try again.")
          }
        },
      },
    ])
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={60} color="#9370DB" />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyText}>Please login to access settings</Text>
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9370DB" />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-circle-outline" size={80} color="#9370DB" />
            )}
            <Text style={styles.avatarText}>Change Photo</Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#666"
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            editable={false} // Email shouldn't be editable in this view
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Your phone number"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Information</Text>

          <Text style={styles.inputLabel}>Shop Name</Text>
          <TextInput
            style={styles.input}
            value={shopName}
            onChangeText={setShopName}
            placeholder="Your shop name"
            placeholderTextColor="#666"
          />

          <Text style={styles.inputLabel}>Shop Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={shopDescription}
            onChangeText={setShopDescription}
            placeholder="Describe your shop"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#9370DB" }}
              thumbColor={notificationsEnabled ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: "#9370DB" }}
              thumbColor={darkMode ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Delete Account Confirmation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalDeleteButton]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={[styles.modalButtonText, styles.modalDeleteButtonText]}>Delete</Text>
                </TouchableOpacity>
              </View>
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
    paddingBottom: 20,
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
    padding: 16,
    alignItems: "center",
  },
  errorContainer: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
  },
  successContainer: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  successText: {
    color: "#34C759",
  },
  section: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    color: "#9370DB",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  avatarText: {
    color: "#9370DB",
    fontSize: 14,
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  switchLabel: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButtonText: {
    color: "#FF3B30",
  },
  saveButton: {
    backgroundColor: "#9370DB",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 10,
  },
  modalDeleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 6,
  },
  modalButtonText: {
    color: "#9370DB",
    fontWeight: "bold",
  },
  modalDeleteButtonText: {
    color: "#fff",
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
})

export default SettingsScreen