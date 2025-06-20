import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Card from './Card';
import CustomCard from './CustomCard';
import CustomModal from './Modal/CustomModal';
import AsyncStorage from '@react-native-async-storage/async-storage';



function Protocolos() {

    const [customCards, setCustomCards] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [newCardColor, setNewCardColor] = useState('0, 92, 157');
    const [newCardSliderValue, newCardSetSliderValue] = useState(50);
    const [newCardSelectedRegion, newCardSetSelectedRegion] = useState('FP1');
    const [newCardData, setNewCardData] = useState({});

    const [selectedCardIndex, setSelectedCardIndex] = useState(null);
    const selectedCard = selectedCardIndex !== null ? customCards[selectedCardIndex] : null;

    const [isPercentageMode, setIsPercentageMode] = useState(false);


    const handleCardSelect = (index) => {
        const card = customCards[index];
        if (!card.deletable) return; // No permitir seleccionar la tarjeta de depresión
        setSelectedCardIndex(index);
        setModalVisible(true);

        // Si hay una carta seleccionada, establece los estados al valor de los atributos de la carta
        if (index !== null) {
            setNewCardTitle(card.title);
            setNewCardColor(card.color);
            newCardSetSliderValue(parseInt(card.powerValue, 10)); // Asegúrate de convertir el valor a número si es necesario
            newCardSetSelectedRegion(card.selectedRegion);

            console.log('card.protocolData', card.protocolData)

            setNewCardData(card.protocolData);
            setIsPercentageMode(card.isPercentageMode);
        }
    };

    const handleAddNewCard = () => {
        setModalVisible(true);
        setSelectedCardIndex(null);
        //vaciar el estado de la nueva tarjeta
        setNewCardTitle('');
        newCardSetSliderValue(50);
        setNewCardColor('0, 92, 157');
        newCardSetSelectedRegion('FP1');
        setNewCardData([]);

    };

    useEffect(() => {
        console.log('newCardData USEFFECT', newCardData)
    }, [newCardData])

    const handleDeleteCard = (indexToDelete) => {
        const newCustomCards = customCards.filter((_, index) => index !== indexToDelete);
        setCustomCards(newCustomCards); // Actualiza el estado con los protocolos filtrados

        // Actualiza AsyncStorage
        AsyncStorage.setItem('customCards', JSON.stringify(newCustomCards)).catch(error => {
            console.error('Error al guardar los custom cards después de la eliminación:', error);
        });
    };


    useEffect(() => {
        const loadCustomCards = async () => {
            try {
                const savedCards = await AsyncStorage.getItem('customCards');
                let cards = JSON.parse(savedCards);

                // Define el protocolo de depresión por defecto
                const defaultDepressionProtocol = {
                    title: "Depresion",
                    hzValue: "2",
                    powerValue: "60 %",
                    iconName: "cloud-drizzle",
                    color: "125, 140, 196",
                    selectedRegion: "FP1",
                    deletable: false,
                    protocolData: [
                        { "duration": 3, "frequency": 575, "id": "1", "timeOff": 744, "timeOn": 1000 },
                        { "duration": 1, "frequency": 0, "id": "2", "timeOff": 10000, "timeOn": 0 }
                    ]
                };

                if (cards === null) {
                    cards = [defaultDepressionProtocol];
                } else {
                    // Verifica si el protocolo de depresión ya está en los cards guardados
                    const depressionExists = cards.some(card => card.title === defaultDepressionProtocol.title);

                    if (!depressionExists) {
                        cards.unshift(defaultDepressionProtocol); // Añade el protocolo de depresión al inicio del array
                    }
                }

                // Actualiza el estado y guarda los cambios en AsyncStorage
                setCustomCards(cards);
                await AsyncStorage.setItem('customCards', JSON.stringify(cards));
            } catch (error) {
                console.error('Error al cargar los custom cards:', error);
            }
        };

        loadCustomCards();
    }, []);


    useEffect(() => {
        const saveCustomCards = async () => {
            try {
                await AsyncStorage.setItem('customCards', JSON.stringify(customCards));
            } catch (error) {
                console.error('Error al guardar los custom cards:', error);
            }
        };

        saveCustomCards();
    }, [customCards]);

    const cleanState = () => {
        setNewCardTitle('');
        newCardSetSliderValue(50);
        setNewCardColor('0, 92, 157');
        newCardSetSelectedRegion('FP1');
        setNewCardData([]);
        setModalVisible(false);
    };

    // In Protocolos.js
    const handleBlocksUpdate = (updatedBlocks) => {
        setNewCardData(updatedBlocks);
        console.log('HANDLING updatedBlocks', updatedBlocks)
    };


    const handleAddCustomCard = () => {

        //Esta funcion detecta si se selecciono una carta, entonces la actualiza, si no añade una nueva

        if (!newCardTitle.trim()) {
            alert("Por favor, ingresa un título para la tarjeta.");
            return;
        }

        // console.log('GUARDANDO DATOS')
        console.log('newCardData', newCardData)
        // console.log('newCardSliderValue', newCardSliderValue)
        // console.log('newCardColor', newCardColor)
        // console.log('newCardSelectedRegion', newCardSelectedRegion)
        // console.log('isPercentageMode', isPercentageMode)
        // console.log('newCardTitle', newCardTitle)

        if (selectedCard) {
            customCards[selectedCardIndex] = {
                title: newCardTitle,
                hzValue: newCardData.length > 0 ? newCardData.length.toString() : customCards[selectedCardIndex].protocolData.length,
                powerValue: newCardSliderValue + ' %',
                iconName: 'loader',
                color: newCardColor,
                selectedRegion: newCardSelectedRegion,
                deletable: true,
                protocolData: newCardData?.length > 0 ? newCardData : customCards[selectedCardIndex].protocolData,
                isPercentageMode: customCards[selectedCardIndex].isPercentageMode
            };
            setCustomCards([...customCards]);
            cleanState();
            return;
        }

        else {

            if (!newCardData.length) {
                alert("No hay bloques en la linea de tiempo del protocolo.");
                return;
            }
            // Verificar si la suma de los bloques supera el 100% en modo porcentual
            if (isPercentageMode) {
                const totalPercentage = newCardData.reduce((acc, block) => acc + block.duration, 0);
                if (totalPercentage < 100) {
                    alert('Los bloques por porcentaje deben sumar 100%');
                    return;
                }
            }

            console.log('Añadiendo nueva tarjeta:', newCardData)
            setCustomCards([...customCards, {
                title: newCardTitle,
                hzValue: newCardData.length ? newCardData.length.toString() : '0',
                powerValue: newCardSliderValue + ' %',
                iconName: 'loader',
                color: newCardColor,
                selectedRegion: newCardSelectedRegion,
                deletable: true,
                protocolData: newCardData,
                isPercentageMode: isPercentageMode
            }]);
            cleanState();
        }
    };

    // useEffect(() => {
    //     if (!modalVisible) {
    //         setNewCardData([]);
    //     }
    // }, [modalVisible]);


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Protocolos</Text>

            <CustomModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                newCardTitle={newCardTitle}
                setNewCardTitle={setNewCardTitle}
                newCardColor={newCardColor}
                setNewCardColor={setNewCardColor}
                handleAddCustomCard={handleAddCustomCard}
                newCardSliderValue={newCardSliderValue}
                newCardSetSliderValue={newCardSetSliderValue}
                newCardSelectedRegion={newCardSelectedRegion}
                newCardSetSelectedRegion={newCardSetSelectedRegion}
                newCardData={newCardData}
                setNewCardData={setNewCardData}
                isPercentageMode={isPercentageMode}
                setIsPercentageMode={setIsPercentageMode}
                onBlocksUpdate={handleBlocksUpdate}
            />

            <View style={styles.cardsContainer}>


                {customCards.map((card, index) => (
                    <Card
                        key={index}
                        {...card}
                        onDelete={() => handleDeleteCard(index)}
                        onSelect={() => handleCardSelect(index)} // Pasar el índice de la carta seleccionada
                    />
                ))}
                {/* <CustomCard onAdd={handleAddNewCard} /> */}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',  // Esto permite que las tarjetas se envuelvan en el siguiente renglón.
        justifyContent: 'space-between',

    },

    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    header: {
        fontSize: 28, // Ajuste para mejorar la legibilidad
        fontWeight: '600', // Menos pesado que 'bold'
        color: '#333', // Color oscuro para texto, mejora la legibilidad
        marginBottom: 24, // Espaciado consistente
    },

    card: {
        width: '48%',
        padding: 20,
        marginVertical: 10,
        borderRadius: 15,
        elevation: 5,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    purpleTopBar: {
        height: 5,
        backgroundColor: '#6B5C9D',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    blueTopBar: {
        height: 5,
        backgroundColor: '#4084D6',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    depressionCard: {
        backgroundColor: 'white',
    },
    customCard: {
        backgroundColor: 'white',
    },
    cardTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20
    },
    icon: {
        marginBottom: 20,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    pill: {
        backgroundColor: 'rgba(107, 92, 157, 0.)',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        paddingHorizontal: 10,
        margin: 5

    },
    pillText: {
        fontSize: 18,
        marginLeft: 5,
        color: 'black'
    },
    selectButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#6B5C9D',
        alignSelf: 'stretch',
        alignItems: 'center'
    },
    selectButtonText: {
        fontSize: 16,
        color: 'white'
    },

});

export default Protocolos;
