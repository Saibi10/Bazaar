"use client";

import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill out all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    console.log("Signing up with", name, email);
    router.push("/login");
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={require("@/assets/images/partial-react-logo.png")} style={styles.logo} />
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

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
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
    color: "white", /* Ensure text input color is white */
  },
  button: {
    backgroundColor: "#007BFF",
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
    color: "#007BFF",
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
});