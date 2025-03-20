import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://localhost:5000/seller/products';

const MyProductsScreen = () => {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);

    // Product form state
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [images, setImages] = useState<string[]>([]); // Store multiple image URIs

    // Request permission to access the camera and photo library
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        })();
    }, []);

    // Function to pick multiple images from the device
    const pickImages = async () => {
        if (images.length >= 5) {
            alert('You can only upload up to 5 images.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            allowsMultipleSelection: true, // Enable multiple selection
        });

        if (!result.canceled) {
            const selectedImages = result.assets.map((asset) => asset.uri); // Get URIs of all selected images
            const remainingSlots = 5 - images.length; // Calculate remaining slots
            const newImages = selectedImages.slice(0, remainingSlots); // Limit to remaining slots
            setImages([...images, ...newImages]); // Add new images to the array
        }
    };

    // Function to remove an image
    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleAddProduct = async () => {
        if (!productName || !productDescription || !price || !quantity || !category || !brand || images.length === 0) {
            setError('Please fill all required fields and add at least one image');
            return;
        }
        setLoading(true);
        try {
            // Convert all images to base64 strings
            const base64Images = await Promise.all(images.map(convertImageToBase64));

            const newProduct = {
                name: productName,
                description: productDescription,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                category,
                brand,
                images: base64Images, // Send all base64 images
            };

            const response = await axios.post(`${API_URL}`, newProduct);
            setProducts([...products, response.data]);
            setModalVisible(false);
            clearForm();
        } catch (err) {
            console.error('Error adding product:', err);
            setError('Failed to add product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to convert an image URI to a base64 string
    const convertImageToBase64 = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const clearForm = () => {
        setProductName('');
        setProductDescription('');
        setPrice('');
        setQuantity('');
        setCategory('');
        setBrand('');
        setImages([]);
        setError(null);
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/profile")}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Products</Text>
                </View>

                {products.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="briefcase-outline" size={60} color="#9370DB" />
                        <Text style={styles.emptyTitle}>No products added</Text>
                        <Text style={styles.emptyText}>You haven't added any products yet</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.addButtonText}>Add New Product</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView>
                        {products.map((product, index) => (
                            <View key={index} style={styles.productItem}>
                                {product.images && product.images.map((img: string, i: number) => (
                                    <Image key={i} source={{ uri: img }} style={styles.productImage} />
                                ))}
                                <Text style={styles.productText}>Name: {product.name}</Text>
                                <Text style={styles.productText}>Brand: {product.brand}</Text>
                                <Text style={styles.productText}>Price: ${product.price}</Text>
                                <Text style={styles.productText}>Quantity: {product.quantity}</Text>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add Product</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView contentContainerStyle={styles.modalScrollContent}>
                                {error && <Text style={styles.errorText}>{error}</Text>}

                                <Text style={styles.inputLabel}>Product Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={productName}
                                    onChangeText={setProductName}
                                    placeholder="Enter product name"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.inputLabel}>Description *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={productDescription}
                                    onChangeText={setProductDescription}
                                    placeholder="Enter product description"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.inputLabel}>Price *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={price}
                                    onChangeText={setPrice}
                                    placeholder="Enter price"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                />

                                <Text style={styles.inputLabel}>Quantity *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    placeholder="Enter quantity"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                />

                                <Text style={styles.inputLabel}>Category *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={category}
                                    onChangeText={setCategory}
                                    placeholder="Enter category"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.inputLabel}>Brand *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={brand}
                                    onChangeText={setBrand}
                                    placeholder="Enter brand"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.inputLabel}>Images * (Max 5)</Text>
                                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
                                    <Text style={styles.imagePickerButtonText}>Upload Images</Text>
                                </TouchableOpacity>
                                <View style={styles.imageList}>
                                    {images.map((uri, index) => (
                                        <View key={index} style={styles.imageContainer}>
                                            <Image source={{ uri }} style={styles.selectedImage} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => removeImage(index)}
                                            >
                                                <Ionicons name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleAddProduct}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save Product</Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%', // Limit modal height to 80% of the screen
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalScrollContent: {
        padding: 16,
    },
    inputLabel: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
    },
    imagePickerButton: {
        backgroundColor: '#9370DB',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    imagePickerButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    imageList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    imageContainer: {
        position: 'relative',
        margin: 4,
    },
    selectedImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        padding: 4,
    },
    saveButton: {
        backgroundColor: '#9370DB',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ff6b6b',
        marginBottom: 12,
    },
    productItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    productImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    productText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 6,
    },
});

export default MyProductsScreen;