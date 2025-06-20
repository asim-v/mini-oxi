import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { useBluetooth } from './BluetoothContext';

const LastDataProcessor = () => {
    const { data } = useBluetooth();
    const [showLastData, setShowLastData] = useState(true);

    useEffect(() => {
        if (data.length > 0 && showLastData) {
            const lastData = data[data.length - 1];
            console.log('Último dato procesado:', lastData);
        }
    }, [data, showLastData]);

    const toggleLastData = () => {
        setShowLastData(prevState => !prevState);
    };

    return (
        <View style={{ padding: 10, backgroundColor: 'rgba(255, 0, 0, 0.2)' }}>
            <Button 
                title={showLastData ? "Ocultar lastData" : "Mostrar lastData"} 
                onPress={toggleLastData} 
            />
            <Text>{showLastData ? "Mostrando último dato" : "Último dato oculto"}</Text>
        </View>
    );
    
    
};

export default LastDataProcessor;
