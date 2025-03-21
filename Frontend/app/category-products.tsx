import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Define the Product type
interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  image: string;
}

const CategoryProductsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Get the category and products from route params
  const { category, products } = useLocalSearchParams();

  // Parse the products string back into an array
  const parsedProducts: Product[] = JSON.parse(products);

  // State for modal visibility and selected product
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');

  // Handle product selection
  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  // Handle buy button press
  const handleBuy = () => {
    if (selectedProduct) {
      if (parseInt(quantity) > selectedProduct.stock) {
        alert(`Only ${selectedProduct.stock} items are available in stock!`);
        return;
      }
      alert(`You bought ${quantity} ${selectedProduct.name}(s) for ${selectedProduct.price} each!`);
      setIsModalVisible(false);
      setSelectedProduct(null);
      setQuantity('1');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Product List */}
      <FlatList
        data={parsedProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productItem}
            onPress={() => handleProductPress(item)}
          >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
            <Text style={styles.productStock}>
              {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Product Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Product Image */}
            <Image
              source={{ uri: selectedProduct?.image }}
              style={styles.modalProductImage}
            />

            {/* Product Details */}
            <Text style={styles.modalProductPrice}>{selectedProduct?.price}</Text>
            <Text style={styles.modalProductStock}>
              {selectedProduct?.stock > 0
                ? `${selectedProduct.stock} in stock`
                : 'Out of stock'}
            </Text>
            <Text style={styles.modalProductDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>

            {/* Quantity Input */}
            <TextInput
              style={styles.quantityInput}
              placeholder="Quantity"
              placeholderTextColor="#8A8A8A"
              keyboardType="numeric"
              value={quantity}
              onChangeText={(text) => setQuantity(text)}
            />

            {/* Buy Button */}
            <TouchableOpacity
              style={[
                styles.buyButton,
                selectedProduct?.stock === 0 && styles.buyButtonDisabled,
              ]}
              onPress={handleBuy}
              disabled={selectedProduct?.stock === 0}
            >
              <Text style={styles.buyButtonText}>
                {selectedProduct?.stock > 0 ? 'Buy Now' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  productList: {
    padding: 16,
  },
  productItem: {
    width: '48%',
    marginBottom: 16,
    marginHorizontal: '1%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9370DB',
  },
  productStock: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalProductImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalProductPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9370DB',
    marginBottom: 8,
  },
  modalProductStock: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 8,
  },
  modalProductDescription: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 16,
  },
  quantityInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: '#9370DB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#555555',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default CategoryProductsScreen;