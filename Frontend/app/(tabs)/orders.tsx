import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    Pressable,
    TextInput,
    Image,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserContext } from '../context/userContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';

interface Order {
    _id: string;
    items: Array<{
        product: {
            _id: string;
            name: string;
            price: number;
        };
        quantity: number;
    }>;
    totalAmount: number;
    status: 'COMPLETED' | 'RETURNED' | 'IN PROGRESS';
    orderDate: string;
    deliveryDate?: string;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
    shippingAddress: {
        _id: string;
        addressLine1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    returnReason?: string;
}

const orderStatuses = [
    { id: '1', title: 'IN PROGRESS', selected: true },
    { id: '2', title: 'COMPLETED', selected: false },
    { id: '3', title: 'RETURNED', selected: false },
];

const API_URL = `${process.env.EXPO_PUBLIC_APIBASE_URL}`;

interface OrderCardProps {
    orderNumber: string;
    date: string;
    items: number;
    total: string;
    status: string;
    isDelivered: boolean;
    returnReason?: string;
    onPress: () => void;
}

const OrderCard = ({ orderNumber, date, items, total, status, isDelivered, returnReason, onPress }: OrderCardProps) => (
    <TouchableOpacity style={orderStyles.container} onPress={onPress}>
        <View style={orderStyles.header}>
            <Text style={orderStyles.orderNumber}>Order #{orderNumber}</Text>
            <Text style={orderStyles.date}>{date}</Text>
        </View>
        <View style={orderStyles.details}>
            <Text style={orderStyles.items}>{items} items</Text>
            <Text style={orderStyles.total}>{total}</Text>
        </View>
        <View style={orderStyles.footer}>
            <View style={[orderStyles.statusBadge, isDelivered && orderStyles.deliveredBadge, status === 'Returned' && orderStyles.returnedBadge]}>
                <Text style={orderStyles.statusText}>{status}</Text>
            </View>
        </View>
        {returnReason && (
            <View style={orderStyles.reasonContainer}>
                <Text style={orderStyles.reasonLabel}>Return reason:</Text>
                <Text style={orderStyles.reasonText}>{returnReason}</Text>
            </View>
        )}
    </TouchableOpacity>
);

// Order Detail Modal Component
const OrderDetailModal = ({ visible, order, onClose, onPay, onReturn, onComplete }: {
    visible: boolean;
    order: Order | null;
    onClose: () => void;
    onPay: () => void;
    onReturn: () => void;
    onComplete: () => void;
}) => {
    if (!order) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <View style={modalStyles.modalHeader}>
                        <Text style={modalStyles.modalTitle}>Order Details</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={modalStyles.modalContent}>
                        {/* Order ID */}
                        <View style={modalStyles.section}>
                            <Text style={modalStyles.sectionTitle}>Order #{order._id.substring(0, 8).toUpperCase()}</Text>
                        </View>

                        {/* Shipping Address */}
                        <View style={modalStyles.section}>
                            <Text style={modalStyles.sectionTitle}>Shipping Address</Text>
                            {order.shippingAddress ? (
                                <View style={modalStyles.addressContainer}>
                                    <Text style={modalStyles.addressText}>
                                        {`${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`}
                                    </Text>
                                    <Text style={modalStyles.addressText}>
                                        {`${order.shippingAddress.state}, ${order.shippingAddress.postalCode}`}
                                    </Text>
                                    <Text style={modalStyles.addressText}>
                                        {order.shippingAddress.country}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={modalStyles.emptyText}>No address information available</Text>
                            )}
                        </View>

                        {/* Order Items */}
                        <View style={modalStyles.section}>
                            <Text style={modalStyles.sectionTitle}>Items</Text>
                            {order.items.map((item, index) => (
                                <View key={index} style={modalStyles.itemContainer}>
                                    <View style={modalStyles.itemInfo}>
                                        <Text style={modalStyles.itemName}>{item.product.name}</Text>
                                        <Text style={modalStyles.itemQuantity}>x{item.quantity}</Text>
                                    </View>
                                    <Text style={modalStyles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                                </View>
                            ))}
                            <View style={modalStyles.totalContainer}>
                                <Text style={modalStyles.totalLabel}>Total Amount</Text>
                                <Text style={modalStyles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Payment Status */}
                        <View style={modalStyles.section}>
                            <Text style={modalStyles.sectionTitle}>Payment Status</Text>
                            <View style={[
                                modalStyles.paymentStatusBadge,
                                order.paymentStatus === 'PAID' && modalStyles.paidBadge,
                                order.paymentStatus === 'FAILED' && modalStyles.failedBadge
                            ]}>
                                <Text style={modalStyles.paymentStatusText}>{order.paymentStatus}</Text>
                            </View>
                        </View>

                        {/* Return Reason (if applicable) */}
                        {order.status === 'RETURNED' && order.returnReason && (
                            <View style={modalStyles.section}>
                                <Text style={modalStyles.sectionTitle}>Return Reason</Text>
                                <View style={modalStyles.returnReasonContainer}>
                                    <Text style={modalStyles.returnReasonText}>{order.returnReason}</Text>
                                </View>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View style={modalStyles.actionsContainer}>
                            {order.paymentStatus !== 'PAID' && (
                                <TouchableOpacity style={modalStyles.payButton} onPress={onPay}>
                                    <Text style={modalStyles.buttonText}>Pay Now</Text>
                                </TouchableOpacity>
                            )}
                            {order.status === 'IN PROGRESS' && order.paymentStatus === 'PAID' && (
                                <TouchableOpacity style={modalStyles.completeButton} onPress={onComplete}>
                                    <Text style={modalStyles.buttonText}>Mark as Delivered</Text>
                                </TouchableOpacity>
                            )}
                            {order.status === 'COMPLETED' && (
                                <TouchableOpacity style={modalStyles.returnButton} onPress={onReturn}>
                                    <Text style={modalStyles.buttonText}>Return Order</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Payment Modal Component
const PaymentModal = ({ visible, onClose, onSubmit }: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (cardDetails: {
        cardNumber: string;
        nameOnCard: string;
        expiryDate: string;
        cvv: string;
    }) => void;
}) => {
    const [cardNumber, setCardNumber] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({
        cardNumber: '',
        nameOnCard: '',
        expiryDate: '',
        cvv: ''
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setCardNumber('');
            setNameOnCard('');
            setExpiryDate('');
            setCvv('');
            setErrors({
                cardNumber: '',
                nameOnCard: '',
                expiryDate: '',
                cvv: ''
            });
            setIsSubmitting(false);
        }
    }, [visible]);

    const formatCardNumber = (text: string) => {
        // Remove non-digit characters
        const cleaned = text.replace(/\D/g, '');
        // Insert space after every 4 digits
        const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
        // Limit to 19 characters (16 digits + 3 spaces)
        return formatted.substring(0, 19);
    };

    const formatExpiryDate = (text: string) => {
        // Remove non-digit characters
        const cleaned = text.replace(/\D/g, '');
        // Format as MM/YY
        if (cleaned.length > 2) {
            return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        return cleaned;
    };

    const validateForm = (): boolean => {
        const newErrors = {
            cardNumber: '',
            nameOnCard: '',
            expiryDate: '',
            cvv: ''
        };
        let isValid = true;

        // Validate card number
        const cleanedCardNumber = cardNumber.replace(/\s/g, '');
        if (!cleanedCardNumber || cleanedCardNumber.length !== 16) {
            newErrors.cardNumber = 'Please enter a valid 16-digit card number';
            isValid = false;
        }

        // Validate name
        if (!nameOnCard.trim()) {
            newErrors.nameOnCard = 'Name on card is required';
            isValid = false;
        }

        // Validate expiry date
        const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryDate || !expiryPattern.test(expiryDate)) {
            newErrors.expiryDate = 'Enter a valid expiry date (MM/YY)';
            isValid = false;
        } else {
            const [month, year] = expiryDate.split('/');
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;

            if (parseInt(year) < currentYear ||
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                newErrors.expiryDate = 'Card has expired';
                isValid = false;
            }
        }

        // Validate CVV
        if (!cvv || cvv.length < 3 || cvv.length > 4) {
            newErrors.cvv = 'Enter a valid CVV (3-4 digits)';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            onSubmit({
                cardNumber,
                nameOnCard,
                expiryDate,
                cvv
            });
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={paymentStyles.centeredView}>
                <View style={paymentStyles.modalView}>
                    <View style={paymentStyles.modalHeader}>
                        <Text style={paymentStyles.modalTitle}>Payment Details</Text>
                        <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={paymentStyles.modalContent}>
                        <View style={paymentStyles.formGroup}>
                            <Text style={paymentStyles.inputLabel}>Card Number</Text>
                            <TextInput
                                style={paymentStyles.input}
                                placeholder="•••• •••• •••• ••••"
                                placeholderTextColor="#777777"
                                value={cardNumber}
                                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                                keyboardType="numeric"
                                maxLength={19} // 16 digits + 3 spaces
                                editable={!isSubmitting}
                            />
                            {errors.cardNumber ? (
                                <Text style={paymentStyles.errorText}>{errors.cardNumber}</Text>
                            ) : null}
                        </View>

                        <View style={paymentStyles.formGroup}>
                            <Text style={paymentStyles.inputLabel}>Name on Card</Text>
                            <TextInput
                                style={paymentStyles.input}
                                placeholder="John Doe"
                                placeholderTextColor="#777777"
                                value={nameOnCard}
                                onChangeText={setNameOnCard}
                                editable={!isSubmitting}
                            />
                            {errors.nameOnCard ? (
                                <Text style={paymentStyles.errorText}>{errors.nameOnCard}</Text>
                            ) : null}
                        </View>

                        <View style={paymentStyles.row}>
                            <View style={[paymentStyles.formGroup, paymentStyles.halfWidth]}>
                                <Text style={paymentStyles.inputLabel}>Expiry Date</Text>
                                <TextInput
                                    style={paymentStyles.input}
                                    placeholder="MM/YY"
                                    placeholderTextColor="#777777"
                                    value={expiryDate}
                                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                                    keyboardType="numeric"
                                    maxLength={5} // MM/YY
                                    editable={!isSubmitting}
                                />
                                {errors.expiryDate ? (
                                    <Text style={paymentStyles.errorText}>{errors.expiryDate}</Text>
                                ) : null}
                            </View>

                            <View style={[paymentStyles.formGroup, paymentStyles.halfWidth]}>
                                <Text style={paymentStyles.inputLabel}>CVV</Text>
                                <TextInput
                                    style={paymentStyles.input}
                                    placeholder="•••"
                                    placeholderTextColor="#777777"
                                    value={cvv}
                                    onChangeText={setCvv}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                    editable={!isSubmitting}
                                />
                                {errors.cvv ? (
                                    <Text style={paymentStyles.errorText}>{errors.cvv}</Text>
                                ) : null}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={paymentStyles.submitButton}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={paymentStyles.buttonText}>Complete Payment</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Return Order Modal Component
const ReturnOrderModal = ({ visible, onClose, onSubmit }: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (returnData: {
        reason: string;
        proofImage?: string;
    }) => void;
}) => {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [proofImage, setProofImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const returnReasons = [
        { id: '1', reason: 'Damaged product' },
        { id: '2', reason: 'Wrong item received' },
        { id: '3', reason: 'Product not as described' },
        { id: '4', reason: 'Missing parts/accessories' },
        { id: '5', reason: 'No longer needed' },
        { id: '6', reason: 'Other reason' }
    ];

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setSelectedReason('');
            setProofImage(null);
            setError('');
            setIsSubmitting(false);
        }
    }, [visible]);

    const requiresProof = (reason: string) => {
        // These reasons require proof image
        return ['Damaged product', 'Wrong item received', 'Product not as described', 'Missing parts/accessories'].includes(reason);
    };

    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                setError('Permission to access camera roll is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                // Using the base64 string of the image
                setProofImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
                setError('');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setError('Failed to pick image. Please try again.');
        }
    };

    const validateForm = (): boolean => {
        if (!selectedReason) {
            setError('Please select a reason for return');
            return false;
        }

        if (requiresProof(selectedReason) && !proofImage) {
            setError(`You need to upload proof for "${selectedReason}"`);
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            onSubmit({
                reason: selectedReason,
                proofImage: proofImage || undefined
            });
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={returnStyles.centeredView}>
                <View style={returnStyles.modalView}>
                    <View style={returnStyles.modalHeader}>
                        <Text style={returnStyles.modalTitle}>Return Order</Text>
                        <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={returnStyles.modalContent}>
                        <View style={returnStyles.section}>
                            <Text style={returnStyles.sectionTitle}>Select Reason for Return</Text>
                            {returnReasons.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        returnStyles.reasonItem,
                                        selectedReason === item.reason && returnStyles.selectedReason
                                    ]}
                                    onPress={() => setSelectedReason(item.reason)}
                                    disabled={isSubmitting}
                                >
                                    <Text style={[
                                        returnStyles.reasonText,
                                        selectedReason === item.reason && returnStyles.selectedReasonText
                                    ]}>
                                        {item.reason}
                                    </Text>
                                    {selectedReason === item.reason && (
                                        <Ionicons name="checkmark-circle" size={20} color="#9370DB" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {selectedReason && requiresProof(selectedReason) && (
                            <View style={returnStyles.section}>
                                <Text style={returnStyles.sectionTitle}>Upload Proof</Text>
                                <Text style={returnStyles.instructions}>
                                    Please provide a photo as evidence for the return reason.
                                </Text>

                                {proofImage ? (
                                    <View style={returnStyles.imageContainer}>
                                        <Image
                                            source={{ uri: proofImage }}
                                            style={returnStyles.proofImage}
                                        />
                                        <TouchableOpacity
                                            style={returnStyles.changeImageButton}
                                            onPress={pickImage}
                                            disabled={isSubmitting}
                                        >
                                            <Text style={returnStyles.changeImageText}>Change Photo</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={returnStyles.uploadButton}
                                        onPress={pickImage}
                                        disabled={isSubmitting}
                                    >
                                        <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
                                        <Text style={returnStyles.uploadButtonText}>Select Photo</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {error ? (
                            <Text style={returnStyles.errorText}>{error}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                returnStyles.submitButton,
                                (!selectedReason || (requiresProof(selectedReason) && !proofImage)) && returnStyles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting || !selectedReason || (requiresProof(selectedReason) && !proofImage)}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={returnStyles.buttonText}>Submit Return Request</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const orderStyles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    orderNumber: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        color: '#999999',
        fontSize: 14,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    items: {
        color: '#CCCCCC',
        fontSize: 14,
    },
    total: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    statusBadge: {
        backgroundColor: '#2A2A2A',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    deliveredBadge: {
        backgroundColor: '#9370DB',
    },
    returnedBadge: {
        backgroundColor: '#F44336',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    reasonContainer: {
        marginTop: 12,
        padding: 10,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#F44336',
    },
    reasonLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    reasonText: {
        color: '#CCCCCC',
        fontSize: 13,
    },
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    addressContainer: {
        backgroundColor: '#2A2A2A',
        padding: 12,
        borderRadius: 8,
    },
    addressText: {
        color: '#CCCCCC',
        fontSize: 14,
        marginBottom: 4,
    },
    emptyText: {
        color: '#999999',
        fontStyle: 'italic',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 4,
    },
    itemQuantity: {
        color: '#999999',
        fontSize: 12,
    },
    itemPrice: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#444444',
    },
    totalLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    totalAmount: {
        color: '#9370DB',
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentStatusBadge: {
        backgroundColor: '#2A2A2A',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    paidBadge: {
        backgroundColor: '#4CAF50',
    },
    failedBadge: {
        backgroundColor: '#F44336',
    },
    paymentStatusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    returnReasonContainer: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#F44336',
    },
    returnReasonText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    actionsContainer: {
        marginTop: 20,
        gap: 12,
    },
    payButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    returnButton: {
        backgroundColor: '#F44336',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

const paymentStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    inputLabel: {
        color: '#FFFFFF',
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: '#2A2A2A',
        color: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

const returnStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    reasonItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        padding: 14,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedReason: {
        backgroundColor: 'rgba(147, 112, 219, 0.2)',
        borderWidth: 1,
        borderColor: '#9370DB',
    },
    reasonText: {
        color: '#CCCCCC',
        fontSize: 15,
    },
    selectedReasonText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    instructions: {
        color: '#AAAAAA',
        marginBottom: 16,
        fontSize: 14,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#444444',
        borderStyle: 'dashed',
    },
    uploadButtonText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontSize: 15,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    proofImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    changeImageButton: {
        backgroundColor: '#2A2A2A',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    changeImageText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    errorText: {
        color: '#FF6B6B',
        marginBottom: 16,
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#F44336',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: '#555555',
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

// User interface to fix type errors
interface User {
    _id: string;
    name: string;
    email: string;
    [key: string]: any; // Allow any other properties
}

export default function OrdersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const userContext = useContext(UserContext);
    const { user, token, refreshUser } = userContext || {};
    const typedUser = user as User | null;
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState('IN PROGRESS');
    const [tabs, setTabs] = useState(orderStatuses);
    const [refreshing, setRefreshing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const lastRefreshTime = useRef(0);
    const minRefreshInterval = 5000; // 5 seconds minimum between refreshes

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

    // Prevent frequent refreshes
    const canRefresh = useCallback(() => {
        const now = Date.now();
        if (now - lastRefreshTime.current > minRefreshInterval) {
            lastRefreshTime.current = now;
            return true;
        }
        return false;
    }, []);

    // Filter orders when tab changes
    const filterOrdersByStatus = useCallback((orderList: Order[], status: string) => {
        const filtered = orderList.filter(order => order.status === status);
        setFilteredOrders(filtered);
    }, []);

    // Function to refresh orders from the API
    const refreshOrders = useCallback(async () => {
        if (!token || !typedUser) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null); // Clear any previous errors

            const response = await axios.get(`${API_URL}/orders/${typedUser._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Check if response data exists and is an array
            if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
                filterOrdersByStatus(response.data, selectedTab);
                setInitialLoadDone(true);
            } else {
                // Handle case where response exists but isn't an array of orders
                console.log("Response data is not an array:", response.data);
                setOrders([]);
                setFilteredOrders([]);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            // Only set error for network/server errors, not for empty orders
            if (axios.isAxiosError(err) && err.response?.status !== 404) {
                setError("Failed to load your orders");
            } else {
                // If it's a 404 or other expected error, just set empty orders
                setOrders([]);
                setFilteredOrders([]);
            }
        } finally {
            setLoading(false);
        }
    }, [token, typedUser, selectedTab, filterOrdersByStatus]);

    // Initial load
    useEffect(() => {
        if (!initialLoadDone && token && typedUser) {
            refreshOrders();
        }
    }, [refreshOrders, initialLoadDone, token, typedUser]);

    // Handle tab changes
    useEffect(() => {
        if (orders.length > 0) {
            filterOrdersByStatus(orders, selectedTab);
        }
    }, [selectedTab, filterOrdersByStatus, orders]);

    // Function to refresh user data when the screen gains focus
    const refreshOnFocus = useCallback(async () => {
        if (!refreshUser || !token || isRefreshing || !typedUser) return;
        if (!canRefresh()) return; // Don't refresh too frequently

        setIsRefreshing(true);
        try {
            await refreshUser();
        } catch (error) {
            console.error("Error refreshing user data on focus:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [refreshUser, token, isRefreshing, typedUser, canRefresh]);

    // Use useFocusEffect to refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            if (isMounted && !isRefreshing && canRefresh()) {
                refreshOnFocus();
            }

            return () => {
                isMounted = false;
            };
        }, [refreshOnFocus, isRefreshing, canRefresh])
    );

    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
        if (refreshing) return;

        setRefreshing(true);
        try {
            if (refreshUser && token) {
                await refreshUser();
            }
            await refreshOrders();
        } catch (error) {
            console.error("Error during refresh:", error);
        } finally {
            setRefreshing(false);
            lastRefreshTime.current = Date.now();
        }
    }, [refreshUser, token, refreshOrders, refreshing]);

    const handleTabPress = (tabTitle: string) => {
        setSelectedTab(tabTitle);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusDisplayText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'Delivered';
            case 'IN PROGRESS':
                return 'Processing';
            case 'RETURNED':
                return 'Returned';
            default:
                return status;
        }
    };

    const handleOrderPress = (order: Order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    const handleCloseModal = () => {
        setDetailModalVisible(false);
        setSelectedOrder(null);
    };

    const handlePayNow = () => {
        // Close the order details modal first, then open the payment modal
        setDetailModalVisible(false);
        setTimeout(() => {
            setPaymentModalVisible(true);
        }, 300); // Small delay to ensure smooth transition
    };

    const handleClosePaymentModal = () => {
        setPaymentModalVisible(false);
        // Reopen the order details modal if payment is canceled
        setTimeout(() => {
            setDetailModalVisible(true);
        }, 300); // Small delay to ensure smooth transition
    };

    const handleSubmitPayment = async (cardDetails: {
        cardNumber: string;
        nameOnCard: string;
        expiryDate: string;
        cvv: string;
    }) => {
        if (!selectedOrder || !token) {
            setPaymentModalVisible(false);
            return;
        }

        try {
            // In a real app, you would send card details to a payment processor
            // Here we're just simulating a successful payment
            console.log('Processing payment with card:', cardDetails.cardNumber.substr(-4));

            // Send PUT request to update payment status
            await axios.put(`${API_URL}/${selectedOrder._id}`,
                { paymentStatus: "PAID" },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state
            if (selectedOrder) {
                const updatedOrder = { ...selectedOrder, paymentStatus: 'PAID' as 'PAID' };
                setSelectedOrder(updatedOrder);

                // Update the order in the orders array
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === selectedOrder._id ? updatedOrder : order
                    )
                );
            }

            setPaymentModalVisible(false);
            // Refresh orders data after payment is completed
            refreshOrders();
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentModalVisible(false);
            // Reopen the order details modal to show the error
            setTimeout(() => {
                setDetailModalVisible(true);
            }, 300);
        }
    };

    const handleReturnOrder = () => {
        setDetailModalVisible(false);
        setTimeout(() => {
            setReturnModalVisible(true);
        }, 300);
    };

    const handleCloseReturnModal = () => {
        setReturnModalVisible(false);
        setTimeout(() => {
            setDetailModalVisible(true);
        }, 300);
    };

    const handleSubmitReturn = async (returnData: {
        reason: string;
        proofImage?: string;
    }) => {
        if (!selectedOrder || !token) {
            setReturnModalVisible(false);
            return;
        }

        try {
            // Save return reason and proof as part of the request payload
            const returnPayload = {
                status: "RETURNED",
                returnReason: returnData.reason,
            };

            // Send PUT request to update order status and return information
            await axios.put(`${API_URL}/${selectedOrder._id}`, returnPayload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update local state
            if (selectedOrder) {
                const updatedOrder = { ...selectedOrder, status: 'RETURNED' as 'RETURNED' };
                setSelectedOrder(updatedOrder);

                // Remove order from the orders list (if currently in IN_PROGRESS tab)
                if (selectedTab === 'IN PROGRESS') {
                    setOrders(prevOrders => prevOrders.filter(order => order._id !== selectedOrder._id));
                }
            }

            setReturnModalVisible(false);
            // Refresh orders data after return is processed
            refreshOrders();
        } catch (error) {
            console.error('Return order error:', error);
            setReturnModalVisible(false);
            setTimeout(() => {
                setDetailModalVisible(true);
            }, 300);
        }
    };

    const showCompletionConfirmation = () => {
        setDetailModalVisible(false); // Hide the order details modal
        setTimeout(() => {
            setConfirmationModalVisible(true); // Show confirmation modal
        }, 300);
    };

    const handleCancelCompletion = () => {
        setConfirmationModalVisible(false);
        setTimeout(() => {
            setDetailModalVisible(true); // Reopen the order details modal
        }, 300);
    };

    const handleCompleteOrder = async () => {
        if (!selectedOrder || !token) return;

        try {
            // Close confirmation modal
            setConfirmationModalVisible(false);

            // Send PUT request to update order status to COMPLETED
            await axios.put(`${API_URL}/${selectedOrder._id}`,
                { status: "COMPLETED" },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state
            if (selectedOrder) {
                const updatedOrder = { ...selectedOrder, status: 'COMPLETED' as 'COMPLETED' };
                setSelectedOrder(updatedOrder);

                // Remove order from the orders list (if currently in IN_PROGRESS tab)
                if (selectedTab === 'IN PROGRESS') {
                    setOrders(prevOrders => prevOrders.filter(order => order._id !== selectedOrder._id));
                }
            }

            // Refresh orders data
            refreshOrders();
        } catch (error) {
            console.error('Complete order error:', error);
        }
    };

    // Confirmation Modal Component
    const ConfirmationModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={confirmationModalVisible}
            onRequestClose={handleCancelCompletion}
        >
            <View style={confirmationStyles.centeredView}>
                <View style={confirmationStyles.modalView}>
                    <View style={confirmationStyles.warningContainer}>
                        <Ionicons name="warning-outline" size={40} color="#F44336" />
                    </View>

                    <Text style={confirmationStyles.modalTitle}>Confirm Delivery</Text>

                    <Text style={confirmationStyles.modalText}>
                        Are you sure you want to mark this order as delivered?
                    </Text>

                    <Text style={confirmationStyles.warningText}>
                        This action cannot be undone, and the order will be moved to the Delivered tab.
                    </Text>

                    <View style={confirmationStyles.buttonContainer}>
                        <TouchableOpacity
                            style={[confirmationStyles.button, confirmationStyles.cancelButton]}
                            onPress={handleCancelCompletion}
                        >
                            <Text style={confirmationStyles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[confirmationStyles.button, confirmationStyles.confirmButton]}
                            onPress={handleCompleteOrder}
                        >
                            <Text style={confirmationStyles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const confirmationStyles = StyleSheet.create({
        centeredView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        modalView: {
            width: '85%',
            backgroundColor: '#1E1E1E',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5
        },
        warningContainer: {
            marginBottom: 16,
        },
        modalTitle: {
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
            textAlign: 'center',
        },
        modalText: {
            color: '#CCCCCC',
            fontSize: 16,
            marginBottom: 16,
            textAlign: 'center',
        },
        warningText: {
            color: '#FF6B6B',
            fontSize: 14,
            marginBottom: 24,
            textAlign: 'center',
        },
        buttonContainer: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            marginTop: 8,
        },
        button: {
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            minWidth: '45%',
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#CCCCCC',
        },
        confirmButton: {
            backgroundColor: '#4CAF50',
        },
        cancelButtonText: {
            color: '#CCCCCC',
            fontWeight: '600',
            fontSize: 16,
        },
        confirmButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: 16,
        },
    });

    // If user is not logged in, show login prompt
    if (!user || !token) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar style="light" />
                <Header title="Orders" />
                <View style={styles.loginPromptContainer}>
                    <Ionicons name="receipt-outline" size={64} color="#6C5CE7" />
                    <Text style={styles.loginPromptTitle}>No Orders Found</Text>
                    <Text style={styles.loginPromptText}>
                        Please log in to view your orders
                    </Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push("/login")}
                    >
                        <Text style={styles.loginButtonText}>Login / Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />

            {/* Header */}
            <Header title="My Orders" />

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            selectedTab === tab.title && styles.selectedTab
                        ]}
                        onPress={() => handleTabPress(tab.title)}
                    >
                        <Text style={[
                            styles.tabText,
                            selectedTab === tab.title && styles.selectedTabText
                        ]}>
                            {tab.title.replace('_', ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Orders List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6C5CE7" />
                    <Text style={styles.loadingText}>Loading your orders...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.ordersContainer}
                    contentContainerStyle={styles.ordersContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#6C5CE7"
                            colors={["#6C5CE7"]}
                        />
                    }
                >
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={refreshOrders}>
                                <Text style={styles.retryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredOrders.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color="#8A8A8A" />
                            <Text style={styles.emptyTitle}>No {selectedTab.toLowerCase()} orders</Text>
                            <Text style={styles.emptyText}>
                                {selectedTab === 'IN PROGRESS'
                                    ? 'You have no orders in progress'
                                    : selectedTab === 'COMPLETED'
                                        ? 'You have no completed orders'
                                        : 'You have no returned orders'}
                            </Text>
                            <TouchableOpacity
                                style={styles.shopButton}
                                onPress={() => router.push("/(tabs)")}
                            >
                                <Text style={styles.shopButtonText}>Shop Now</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {filteredOrders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    orderNumber={order._id.substring(0, 8).toUpperCase()}
                                    date={formatDate(order.orderDate)}
                                    items={order.items.length}
                                    total={`$${order.totalAmount.toFixed(2)}`}
                                    status={getStatusDisplayText(order.status)}
                                    isDelivered={order.status === 'COMPLETED'}
                                    returnReason={order.returnReason}
                                    onPress={() => handleOrderPress(order)}
                                />
                            ))}
                        </>
                    )}
                </ScrollView>
            )}

            {/* Order Details Modal */}
            <OrderDetailModal
                visible={detailModalVisible}
                order={selectedOrder}
                onClose={handleCloseModal}
                onPay={handlePayNow}
                onReturn={handleReturnOrder}
                onComplete={showCompletionConfirmation}
            />

            {/* Payment Modal */}
            <PaymentModal
                visible={paymentModalVisible}
                onClose={handleClosePaymentModal}
                onSubmit={handleSubmitPayment}
            />

            {/* Return Order Modal */}
            <ReturnOrderModal
                visible={returnModalVisible}
                onClose={handleCloseReturnModal}
                onSubmit={handleSubmitReturn}
            />

            {/* Order Completion Confirmation Modal */}
            <ConfirmationModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        marginTop: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#2A2A2A',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    selectedTab: {
        backgroundColor: '#9370DB',
        borderColor: '#9370DB',
    },
    tabText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 14,
    },
    selectedTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    ordersContainer: {
        flexGrow: 1,
        padding: 16,
    },
    ordersContent: {
        gap: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 16,
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        minHeight: 400, // Ensure it takes up enough space
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        color: '#999999',
        fontSize: 16,
        textAlign: 'center',
        maxWidth: '80%',
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
    },
    shopButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    // Login prompt styles
    loginPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loginPromptTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    loginPromptText: {
        color: '#999999',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    loginButton: {
        backgroundColor: '#9370DB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
