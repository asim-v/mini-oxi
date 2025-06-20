import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RecordButton = ({ isRecording, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <MaterialIcons name={isRecording ? 'stop' : 'fiber-manual-record'} size={24} color={isRecording ? 'red' : 'green'} />
            <Text style={styles.text}>{isRecording ? 'Stop' : 'Record'}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
});

export default RecordButton;
