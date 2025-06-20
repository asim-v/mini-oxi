import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import SelectPatient from './SelectPatient';
import SelectProtocol from './SelectProtocol';
import TargetSelector from './TargetSelector';


const ProgressContainer = ({ isAnimated, setIsAnimated, selectedSession }) => {
    const [currentView, setCurrentView] = useState(0);
    const [progress, setProgress] = useState([true, false, false]);

    const [selectedPatient, setSelectedPatient] = useState(null); // Almacena el paciente seleccionado
    const [selectedProtocol, setSelectedProtocol] = useState(null); // Almacena el protocolo seleccionado


    const activeCircle = useSharedValue(0);
    const circlePosition = useSharedValue(0);

    useEffect(() => {
        if (selectedSession) {
            // Asigna el paciente y el protocolo directamente a partir de la sesión seleccionada.
            setSelectedPatient(selectedSession.patient);
            setProgress([true, true, false]);
            // completeView(0);
            // setSelectedProtocol(selectedSession.protocol);

            // setProgress([true, true, true]); // Esto indica que las dos primeras vistas están 'completas'.
            // setCurrentView(2); // Salta directamente a la tercera vista.
        }
    }, [selectedSession]);



    const handleCirclePress = (index) => {
        if (progress[index]) {
            setCurrentView(index);
            activeCircle.value = index;
            circlePosition.value = index * (circleConfig.diameter + circleConfig.margin * 2); // Utilizamos el objeto circleConfig
        }
    };

    const completeView = (index) => {
        const newProgress = [...progress];
        if (index < progress.length - 1) {
            newProgress[index + 1] = true;
            setCurrentView(currentView + 1); // Cambiar a la siguiente vista
            activeCircle.value = currentView + 1; // Actualizar el círculo activo
            circlePosition.value = (currentView + 1) * (circleConfig.diameter + circleConfig.margin * 2); // Actualizar la posición del círculo
        }
        setProgress(newProgress);
    };



    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: withTiming(circlePosition.value, { duration: 300 }) },
                { translateY: withTiming(paddingVertical, { duration: 0 }) },
            ],
        };
    });

    const completeAndMoveNext = (item) => {
        console.log('Item seleccionado:', item);
        if (item.diagnosis) {
            setSelectedPatient(item);
        } else if (item) {
            setSelectedProtocol(item);
        }
        completeView(currentView);
    };

    const render = (currentView) => {
        switch (currentView) {
            case 0:
                return <SelectPatient onPatientSelect={(item) => completeAndMoveNext(item)} />;
            case 1:
                return <SelectProtocol onProtocolSelect={(item) => completeAndMoveNext(item)} />;
            case 2:
                return <TargetSelector selectedPatient={selectedPatient} selectedProtocol={selectedProtocol} isAnimated={isAnimated} setIsAnimated={setIsAnimated} />;
            default:
                return <Text>DV</Text>;
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.circleContainer}>
                <Animated.View style={[styles.circle, styles.animatedCircle, animatedCircleStyle]} />
                {progress.map((available, index) => (
                    <TouchableOpacity key={index} onPress={() => handleCirclePress(index)} style={styles.circleTouchable(circleConfig)}>
                        <View style={[styles.circle, available ? styles.circleActive : styles.circleInactive]} />
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.viewContainer}>

                {render(currentView)}


            </View>
        </View>
    );
};

const circleConfig = {
    diameter: 32,
    margin: 20,
};

const paddingVertical = 10;

const styles = StyleSheet.create({
    animatedCircle: {
        position: 'absolute',
        backgroundColor: '#4a75ff',
        borderColor: '#819efc',
        zIndex: 1,
        width: circleConfig.diameter,
        height: circleConfig.diameter,
        borderRadius: circleConfig.diameter / 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    circleTouchable: (config) => ({
        width: config.diameter,
        height: config.diameter,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: config.margin,
    }),
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingVertical: 0,
    },
    circleContainer: {
        flexDirection: 'row',
        paddingVertical: paddingVertical,
        backgroundColor: '#ebf8fa',
        borderRadius: 100,
        position: 'absolute',
        zIndex: 2,
        alignSelf: 'flex-end',
        right: 0,
        top: paddingVertical,
    },
    circle: {
        width: circleConfig.diameter,
        height: circleConfig.diameter,
        borderRadius: circleConfig.diameter / 2,
        marginHorizontal: circleConfig.margin,
    },
    circleActive: {
        backgroundColor: '#b0c3ff',
    },
    circleInactive: {
        backgroundColor: '#d7e4f5',
    },
    viewContainer: {
        alignItems: 'center',
        justifyContent: 'center',

    },
    button: {
        backgroundColor: 'lightblue',
        padding: 10,
    },
});

export default ProgressContainer;
