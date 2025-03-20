"use client";

import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store the token and user data in AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // Login successful
      console.log("Login successful:", data);
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    }
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <ThemedText style={styles.buttonText}>Login</ThemedText>
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
    backgroundColor: "#6C5CE7",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  signUpText: {
    marginTop: 16,
    color: "#6C5CE7",
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
});
