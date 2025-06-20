import React, { useState, useEffect } from 'react';
import { Text, StyleSheet,View } from 'react-native';
import AnimatedLoader from 'react-native-animated-loader';
import { useBluetooth } from '../BluetoothContext';
import LottieView from "lottie-react-native";
import { BlurView } from '@react-native-community/blur';

const LoaderOverlay = () => {
    const { connectedDevice } = useBluetooth();
    const [isVisible, setIsVisible] = useState(connectedDevice == null);

    useEffect(() => {
        // Actualiza isVisible cuando connectedDevice cambia
        setIsVisible(connectedDevice == undefined);
    }, [connectedDevice]);

    useEffect(() => {
        connectedDevice && console.log('Dispositvo Conectado', connectedDevice.id);

    }, [connectedDevice]);

    return (
        <>
            {isVisible ?
                <View style = {styles.full}>
                    <BlurView
                        style={styles.absolute}
                        blurType="dark"
                        blurAmount={5}
                        reducedTransparencyFallbackColor="white"
                    />
                    <LottieView
                        source={require("./comp.json")}
                        style={styles.lottie}
                        autoPlay
                        loop

                    />
                    <Text style={styles.animationText}>Preparando dispositivo...</Text>
                </View> : null}
        </>
    );
};



const styles = StyleSheet.create({
    full: {
        flex: 1,
        position: 'absolute',
        zIndex: 100,
        width: '105%',

        justifyContent: 'center',
        alignItems: 'center',
        top: '0',
    },
    lottie: {
        width: 300,
        height: 300,
        
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    animationText: {
        top: 20,
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default LoaderOverlay;
