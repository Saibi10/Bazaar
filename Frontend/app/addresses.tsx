import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import axios from 'axios';

const API_URL = 'http://localhost:5000/user/addresses';

const AddressScreen = ({ navigation }) => {
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [addressType, setAddressType] = useState('Default');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Address type options
    const addressTypes = ['Default', 'Home', 'Office'];

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/addresses`);
            setAddresses(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching addresses:', err);
            setError('Failed to load addresses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async () => {
        if (!name || !phoneNumber || !addressLine1 || !city || !state || !postalCode || !country) {
            setError('Please fill all required fields');
            return;
        }

        try {
            const newAddress = {
                type: addressType,
                name,
                phoneNumber,
                addressLine1,
                addressLine2,
                city,
                state,
                postalCode,
                country,
            };

            await axios.post(`${API_URL}/addresses`, newAddress);
            setModalVisible(false);
            clearForm();
            fetchAddresses();
        } catch (err) {
            console.error('Error adding address:', err);
            setError('Failed to add address. Please try again.');
        }
    };

    const clearForm = () => {
        setAddressType('Default');
        setName('');
        setPhoneNumber('');
        setAddressLine1('');
        setAddressLine2('');
        setCity('');
        setState('');
        setPostalCode('');
        setCountry('');
        setError(null);
    };

    const renderAddressItem = ({ item }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                    <Text style={styles.addressType}>{item.type}</Text>
                </View>
                <TouchableOpacity>
                    <MaterialIcons name="edit" size={20} color="#9370DB" />
                </TouchableOpacity>
            </View>

            <Text style={styles.addressName}>{item.name}</Text>
            <Text style={styles.addressText}>{item.addressLine1}</Text>
            {item.addressLine2 ? <Text style={styles.addressText}>{item.addressLine2}</Text> : null}
            <Text style={styles.addressText}>{`${item.city}, ${item.state} ${item.postalCode}`}</Text>
            <Text style={styles.addressText}>{item.country}</Text>
            <Text style={styles.addressText}>{item.phoneNumber}</Text>

            <View style={styles.addressActions}>
                <TouchableOpacity style={styles.defaultButton}>
                    <Text style={styles.defaultButtonText}>
                        {item.type === 'Default' ? 'Default Address' : 'Set as Default'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <MaterialIcons name="delete-outline" size={20} color="#9370DB" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={60} color="#9370DB" />
            <Text style={styles.emptyTitle}>No Addresses Found</Text>
            <Text style={styles.emptyText}>
                You haven't added any addresses yet. Add an address to continue.
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonText}>Add New Address</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.push("/(tabs)/profile")}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Addresses</Text>
                {addresses.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={styles.headerButton}
                    >
                        <Ionicons name="add" size={24} color="#9370DB" />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#9370DB" />
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyList}
                />
            )}

            {/* Add Address Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    clearForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Address</Text>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                clearForm();
                            }}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {error && <Text style={styles.errorText}>{error}</Text>}

                            {/* Address Type Dropdown */}
                            <Text style={styles.inputLabel}>Address Type *</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <Text style={styles.dropdownButtonText}>{addressType}</Text>
                                <Ionicons
                                    name={dropdownOpen ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#9370DB"
                                />
                            </TouchableOpacity>

                            {dropdownOpen && (
                                <View style={styles.dropdownMenu}>
                                    {addressTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setAddressType(type);
                                                setDropdownOpen(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.dropdownItemText,
                                                addressType === type && styles.dropdownItemTextActive
                                            ]}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#666"
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.inputLabel}>Address Line 1 *</Text>
                            <TextInput
                                style={styles.input}
                                value={addressLine1}
                                onChangeText={setAddressLine1}
                                placeholder="Street address, P.O. box"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Address Line 2</Text>
                            <TextInput
                                style={styles.input}
                                value={addressLine2}
                                onChangeText={setAddressLine2}
                                placeholder="Apartment, suite, unit, building, floor, etc."
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>City *</Text>
                            <TextInput
                                style={styles.input}
                                value={city}
                                onChangeText={setCity}
                                placeholder="Enter city"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>State/Province *</Text>
                            <TextInput
                                style={styles.input}
                                value={state}
                                onChangeText={setState}
                                placeholder="Enter state or province"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Postal Code *</Text>
                            <TextInput
                                style={styles.input}
                                value={postalCode}
                                onChangeText={setPostalCode}
                                placeholder="Enter postal code"
                                placeholderTextColor="#666"
                                keyboardType="number-pad"
                            />

                            <Text style={styles.inputLabel}>Country *</Text>
                            <TextInput
                                style={styles.input}
                                value={country}
                                onChangeText={setCountry}
                                placeholder="Enter country"
                                placeholderTextColor="#666"
                            />

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleAddAddress}
                            >
                                <Text style={styles.saveButtonText}>Save Address</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    headerButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        marginTop: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    addressCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressTypeContainer: {
        backgroundColor: 'rgba(147, 112, 219, 0.2)',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    addressType: {
        color: '#9370DB',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addressName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    addressText: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 2,
    },
    addressActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    defaultButton: {
        paddingVertical: 6,
    },
    defaultButtonText: {
        color: '#9370DB',
        fontSize: 14,
        fontWeight: '500',
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
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalContent: {
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
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    dropdownButton: {
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    dropdownButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    dropdownMenu: {
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#444',
        zIndex: 1000,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    dropdownItemText: {
        color: '#ccc',
        fontSize: 16,
    },
    dropdownItemTextActive: {
        color: '#9370DB',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#9370DB',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
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
});

export default AddressScreen;