import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

const Chip = ({ text, icon, style, textStyle, onPress }) => {
    return (
        <TouchableRipple
            onPress={onPress}
            style={[styles.chip, style]}
            rippleColor="rgba(0, 0, 0, .32)"
        >
            <View style={styles.content}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={[styles.text, textStyle]}>{text}</Text>
            </View>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        margin: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 6,
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
});

export default Chip;
