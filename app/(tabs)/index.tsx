"use client"

import { StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from "react-native"
import { useRouter } from "expo-router"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import ParallaxScrollView from "@/components/ParallaxScrollView"
import { type Product, type Category, products, categories, featuredProducts } from "@/data/products"

export default function HomeScreen() {
  const router = useRouter()

  const navigateToProduct = (productId: number) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: productId.toString() },
    })
  }

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => console.log(`Category: ${item.name}`)}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <ThemedText type="defaultSemiBold" style={styles.categoryName}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  )

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productItem} onPress={() => navigateToProduct(item.id)}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <ThemedView style={styles.productInfo}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText>${item.price.toFixed(2)}</ThemedText>
        <ThemedText style={styles.ratingText}>
          ★ {item.rating} ({item.reviews})
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  )

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#F8F8F8", dark: "#1A1A1A" }}
      headerImage={<Image source={require("@/assets/images/partial-react-logo.png")} style={styles.headerLogo} />}
    >
      <ThemedView style={styles.container}>
        {/* Banner */}
        <ThemedView style={styles.banner}>
          <ThemedText type="title">Welcome to Bazaar</ThemedText>
          <ThemedText>Shop from local small businesses</ThemedText>
        </ThemedView>

        {/* Categories */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Categories</ThemedText>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </ThemedView>

        {/* Featured Products */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Featured Products</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.featuredItem}
                onPress={() => navigateToProduct(product.id)}
              >
                <Image source={{ uri: product.image }} style={styles.featuredImage} />
                <ThemedView style={styles.featuredInfo}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1}>
                    {product.name}
                  </ThemedText>
                  <ThemedText>${product.price.toFixed(2)}</ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* New Arrivals */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">New Arrivals</ThemedText>
          <FlatList
            data={products.slice(0, 6)}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.productGrid}
          />
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
    opacity: 0.5,
  },
  banner: {
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  categoriesList: {
    paddingVertical: 12,
  },
  categoryItem: {
    marginRight: 16,
    alignItems: "center",
    width: 80,
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  categoryName: {
    textAlign: "center",
  },
  productGrid: {
    paddingTop: 8,
  },
  productItem: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  ratingText: {
    fontSize: 12,
    marginTop: 4,
    color: "#FFB800",
  },
  featuredItem: {
    width: 250,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  featuredInfo: {
    padding: 12,
  },
})

