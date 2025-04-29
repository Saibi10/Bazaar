"use client";

import { useState, useContext } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { UserContext } from "./context/userContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    const URL = process.env.EXPO_PUBLIC_APIBASE_URL;

    try {
      const response = await fetch(`${URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Use the login function from UserContext
      login(data.user, data.token);

      // Login successful
      console.log("Login successful:", data);
      setIsLoading(false);
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Function to handle "Sign in as Guest"
  const handleGuestLogin = () => {
    console.log("Signed in as guest");
    router.push("/(tabs)"); // Navigate to the main app interface
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
      <ThemedText type="title">Welcome to Bazaar</ThemedText>
      <ThemedText>Sign in to continue</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="white"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="white"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      <TouchableOpacity
        style={[styles.button, isLoading ? styles.buttonDisabled : null]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <ThemedText style={styles.buttonText}>
          {isLoading ? "Logging in..." : "Login"}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
        <ThemedText style={styles.guestButtonText}>Sign in as Guest</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signUp")}>
        <ThemedText style={styles.signUpText}>Don't have an account? Sign Up</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 12,
    color: "white",
  },
  button: {
    backgroundColor: "#9370DB",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  guestButton: {
    backgroundColor: "transparent",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9370DB",
  },
  guestButtonText: {
    color: "#9370DB",
    fontWeight: "bold",
  },
  signUpText: {
    marginTop: 16,
    color: "#9370DB",
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
});