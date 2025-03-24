import React from 'react';
import { Stack } from 'expo-router';
import { UserProvider } from './context/userContext';

export default function RootLayout() {
    return (
        <UserProvider> {/* Single UserProvider at the Root Level */}
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="addresses" />
                <Stack.Screen name="login" />
                <Stack.Screen name="signUp" />
                <Stack.Screen name="my-products" />
                <Stack.Screen name="my-wishlist" />
                <Stack.Screen name="category-products" />
            </Stack>
        </UserProvider>
    );
}
