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

// Define user type based on the database model
interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  addresses: string[];
  orders: string[];
}

// Define custom UserContext type
interface UserContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const SettingsScreen = () => {
  const router = useRouter()
  const userContext = useContext(UserContext) as UserContextType
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)

  // User settings state
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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
    if (!userContext || !userContext.user) return

    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/${userContext.user._id}`)

      const userData = response.data
      setName(userData.name || "")
      setUsername(userData.username || "")
      setEmail(userData.email || "")
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
    if (!userContext.user) {
      Alert.alert("Authentication Required", "You need to login to update your profile.")
      return
    }

    // Validate passwords if the user is trying to change it
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match")
        return
      }
      if (!password) {
        setError("Current password is required to set a new password")
        return
      }
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // For password changes, we need to use JSON format instead of FormData
      if (newPassword && password) {
        console.log("Submitting password change")
        const passwordData = {
          currentPassword: password,
          newPassword: newPassword
        }

        // Send password update separately
        const passwordResponse = await axios.put(`${API_URL}/${userContext.user._id}`, passwordData, {
          headers: {
            'Content-Type': 'application/json',
          }
        })

        console.log("Password update response:", passwordResponse.data)

        // Clear password fields after update
        setPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }

      // Only continue with other profile updates if there are changes
      if (name || username || avatar) {
        const formData = new FormData()

        // Add text fields
        if (name) formData.append("name", name)
        if (username) formData.append("username", username)

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

        // Removed authorization header
        const response = await axios.put(`${API_URL}/${userContext.user._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        console.log("Profile update response:", response.data)
      }

      setSuccess("Profile updated successfully!")
      userContext.refreshUser()

    } catch (err: any) {
      console.error("Error updating profile:", err)
      const errorMessage = err.response?.data?.message || "Failed to update profile. Please try again."
      setError(errorMessage)
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
          userContext.logout()
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
          if (!userContext.user) return

          setLoading(true)
          try {
            await axios.delete(`${API_URL}/${userContext.user._id}`)

            userContext.logout()
            router.replace("/login")
          } catch (err: any) {
            console.error("Error deleting account:", err)
            const errorMessage = err.response?.data?.message || "Failed to delete account. Please try again."
            setError(errorMessage)
            setLoading(false)
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

          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Your username"
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter current password"
            placeholderTextColor="#666"
            secureTextEntry
          />

          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#666"
            secureTextEntry
          />

          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#666"
            secureTextEntry
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