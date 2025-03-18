"use client"

import { useLocalSearchParams, useRouter } from "expo-router"
import { StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { useState } from "react"
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { products } from "@/data/products"

const { width } = Dimensions.get("window")

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const [quantity, setQuantity] = useState(1)

    // Find the product by id
    const product = products.find((p) => p.id.toString() === id)

    if (!product) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Product not found</ThemedText>
            </ThemedView>
        )
    }

    const incrementQuantity = () => setQuantity((prev) => prev + 1)
    const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <AntDesign name="arrowleft" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.wishlistButton}>
                    <AntDesign name="hearto" size={24} color="#000" />
                </TouchableOpacity>
            </ThemedView>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Images */}
                <Image source={{ uri: product.image }} style={styles.productImage} />

                {/* Product Info */}
                <ThemedView style={styles.productInfo}>
                    <ThemedText type="title">{product.name}</ThemedText>

                    <ThemedView style={styles.ratingContainer}>
                        <ThemedText style={styles.ratingText}>★ {product.rating}</ThemedText>
                        <ThemedText style={styles.reviewsText}>({product.reviews} reviews)</ThemedText>
                    </ThemedView>

                    <ThemedText type="subtitle" style={styles.price}>
                        ${product.price.toFixed(2)}
                    </ThemedText>

                    <ThemedText style={styles.description}>{product.description}</ThemedText>

                    {/* Size Selection if applicable */}
                    {product.category === "clothing" && (
                        <ThemedView style={styles.sizeContainer}>
                            <ThemedText type="defaultSemiBold">Size</ThemedText>
                            <ThemedView style={styles.sizeOptions}>
                                {["S", "M", "L", "XL"].map((size) => (
                                    <TouchableOpacity key={size} style={styles.sizeOption}>
                                        <ThemedText>{size}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </ThemedView>
                        </ThemedView>
                    )}

                    {/* Color Selection if applicable */}
                    {(product.category === "clothing" || product.category === "accessories") && (
                        <ThemedView style={styles.colorContainer}>
                            <ThemedText type="defaultSemiBold">Color</ThemedText>
                            <ThemedView style={styles.colorOptions}>
                                {["#000", "#D3D3D3", "#4169E1", "#8B4513"].map((color) => (
                                    <TouchableOpacity key={color} style={[styles.colorOption, { backgroundColor: color }]} />
                                ))}
                            </ThemedView>
                        </ThemedView>
                    )}

                    {/* Quantity Selector */}
                    <ThemedView style={styles.quantityContainer}>
                        <ThemedText type="defaultSemiBold">Quantity</ThemedText>
                        <ThemedView style={styles.quantitySelector}>
                            <TouchableOpacity onPress={decrementQuantity} style={styles.quantityButton}>
                                <Feather name="minus" size={20} color="#000" />
                            </TouchableOpacity>
                            <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
                            <TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
                                <Feather name="plus" size={20} color="#000" />
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>

                    {/* Seller Info */}
                    <ThemedView style={styles.sellerContainer}>
                        <ThemedText type="defaultSemiBold">Seller</ThemedText>
                        <ThemedView style={styles.sellerInfo}>
                            <Image source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }} style={styles.sellerImage} />
                            <ThemedView>
                                <ThemedText type="defaultSemiBold">{product.seller}</ThemedText>
                                <ThemedText style={styles.sellerLocation}>
                                    <MaterialIcons name="location-on" size={14} color="#666" /> {product.location}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            </ScrollView>

            {/* Bottom Action Buttons */}
            <ThemedView style={styles.actionContainer}>
                <TouchableOpacity style={styles.bulkButton}>
                    <ThemedText style={styles.bulkButtonText}>Buy in Bulk</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartButton}>
                    <ThemedText style={styles.cartButtonText}>Add to Cart</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    wishlistButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    productImage: {
        width: width,
        height: width,
        resizeMode: "cover",
    },
    productInfo: {
        padding: 20,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 12,
    },
    ratingText: {
        color: "#FFB800",
        marginRight: 4,
    },
    reviewsText: {
        color: "#666",
    },
    price: {
        marginBottom: 16,
    },
    description: {
        lineHeight: 22,
        marginBottom: 24,
    },
    sizeContainer: {
        marginBottom: 20,
    },
    sizeOptions: {
        flexDirection: "row",
        marginTop: 10,
    },
    sizeOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#DDD",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    colorContainer: {
        marginBottom: 20,
    },
    colorOptions: {
        flexDirection: "row",
        marginTop: 10,
    },
    colorOption: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#DDD",
    },
    quantityContainer: {
        marginBottom: 20,
    },
    quantitySelector: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#DDD",
        justifyContent: "center",
        alignItems: "center",
    },
    quantityText: {
        marginHorizontal: 16,
        fontSize: 16,
    },
    sellerContainer: {
        marginBottom: 100,
    },
    sellerInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        padding: 12,
        backgroundColor: "#F8F8F8",
        borderRadius: 12,
    },
    sellerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    sellerLocation: {
        color: "#666",
        marginTop: 4,
    },
    actionContainer: {
        flexDirection: "row",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderTopColor: "#EEE",
    },
    bulkButton: {
        flex: 1,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 25,
        marginRight: 10,
    },
    bulkButtonText: {
        fontWeight: "600",
    },
    cartButton: {
        flex: 1,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        borderRadius: 25,
        marginLeft: 10,
    },
    cartButtonText: {
        color: "#FFF",
        fontWeight: "600",
    },
})

