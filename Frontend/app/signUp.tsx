"use client";

import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !username || !password || !confirmPassword) {
      setError("Please fill out all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      console.log("Signup successful:", data);
      router.push("/login");
    } catch (error) {
      console.error("Error during signup:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
      <ThemedText type="title">Create an Account</ThemedText>
      <ThemedText>Sign up to get started</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="white"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="white"
        value={username}
        onChangeText={setUsername}
      />
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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="white"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <ThemedText style={styles.signUpText}>Already have an account? Login</ThemedText>
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