import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
    title?: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    customRightComponent?: React.ReactNode;
}

const Header = ({
    title = 'Bazaar',
    showBackButton = false,
    onBackPress,
    customRightComponent
}: HeaderProps) => {
    return (
        <LinearGradient
            colors={['#9370DB', '#8A2BE2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
        >
            <View style={styles.leftContainer}>
                {showBackButton && (
                    <TouchableOpacity
                        onPress={onBackPress}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo2.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.logoText}>{title}</Text>
                </View>
            </View>

            {customRightComponent ? (
                customRightComponent
            ) : (
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 32,
        height: 32,
        marginRight: 8,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 16,
    },
});

export default Header; 