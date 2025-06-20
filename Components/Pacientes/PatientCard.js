import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BlurView } from '@react-native-community/blur';
import ReusableModal from '../ReusableModal';

const PatientCard = ({ patient, onPress, onDelete }) => {
    const [showDelete, setShowDelete] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const handleLongPress = () => {
        setShowDelete(true);
    };

    const hideModal = () => {
        setShowDelete(false);
        setModalVisible(false);
        console.log(patient.completedSessions)
    };

    const handleDelete = () => {
        onDelete && onDelete(patient.id);
        Alert.alert("Paciente eliminado");
        hideModal();
    };


    return (
        <TouchableOpacity
            // Ajustando el estilo para incluir un borde superior colorido y con grosor
            style={[styles.patientCard, { borderColor: patient.color, borderTopWidth: 10 }]}
            onLongPress={handleLongPress}
            onPress={() => onPress(patient)} // Modificación aquí

        >
            <Text style={styles.cardTitle}>{patient.name}</Text>
            <Text style={styles.cardSubtitle}>{patient.diagnosis}</Text>
            <View style={styles.sessionsInfo}>
                <Text style={styles.sessionsText}>Sesiones: {patient.completedSessions}/{patient.prescribedSessions}</Text>
            </View>

            {showDelete && (
                <>
                    <BlurView
                        style={styles.absolute}
                        blurType="light"
                        blurAmount={1}
                        reducedTransparencyFallbackColor="white"
                    />
                    <TouchableOpacity style={styles.closeButton} onPress={hideModal}>
                        <Icon name="x" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
                        <Icon name="trash" size={24} color="#fff" />
                    </TouchableOpacity>
                </>
            )}

            <ReusableModal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <BlurView
                    style={styles.absolute}
                    blurType="light"
                    blurAmount={1}
                    reducedTransparencyFallbackColor="white"
                />
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>¿Seguro que quieres eliminar este paciente?</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel, { width: '45%' }]}
                                onPress={hideModal}
                            >
                                <Text style={styles.textStyle}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose, { width: '45%' }]}
                                onPress={handleDelete}
                            >
                                <Text style={styles.textStyle}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ReusableModal>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        flex: 1,
        justifyContent: 'space-around', // Esto asegura que el espaciado entre tarjetas sea uniforme
    },
    patientCard: {
        width: '30%', // Ajusta este valor según el espaciado deseado
        backgroundColor: '#FFFFFF', // Fondo blanco para resaltar cada tarjeta
        borderRadius: 10, // Bordes redondeados para suavizar la estética
        padding: 20, // Espaciado interno generoso para una apariencia limpia
        marginVertical: 8, // Margen vertical para separar las tarjetas
        marginHorizontal: 10, // Margen horizontal para mantener espacio del borde de la pantalla
        shadowColor: '#000', // Color de sombra para dar profundidad
        shadowOffset: {
            width: 0,
            height: 2, // Posicionamiento de la sombra para un efecto elevado
        },
        shadowOpacity: 0.1, // Opacidad de la sombra no demasiado intensa
        shadowRadius: 8, // Radio de la sombra para un efecto suave
        elevation: 5, // Elevación para sombra en Android
    },
    cardTitle: {
        fontSize: 18, // Tamaño de fuente significativo para el nombre
        fontWeight: 'bold', // Negrita para destacar el nombre del paciente
        color: '#263238', // Color oscuro para el texto, mejora la legibilidad
        marginBottom: 5, // Espacio después del título para separación
    },
    cardSubtitle: {
        fontSize: 14, // Tamaño adecuado para el subtítulo, más pequeño que el título
        color: '#607D8B', // Color suave para el diagnóstico, distingue de otros textos
        marginBottom: 10, // Margen antes del progreso para separar visualmente
        padding: 5,
        backgroundColor: '#F0F0F0',
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        alignSelf: 'flex-start',


        borderRadius: 5,
    },
    progressBar: {
        height: 8, // Altura del ProgressBar para sutileza
        borderRadius: 5, // Bordes redondeados para el ProgressBar
        backgroundColor: '#ECEFF1', // Fondo del ProgressBar
        marginBottom: 15, // Espacio después del ProgressBar
    },
    cardButton: {
        backgroundColor: '#42A5F5', // Color llamativo para el botón
        borderRadius: 20, // Bordes redondeados para el botón
        paddingVertical: 10, // Espaciado vertical dentro del botón
        paddingHorizontal: 20, // Espaciado horizontal dentro del botón
        alignItems: 'center', // Centrar texto del botón
        justifyContent: 'center', // Asegurar que el contenido esté centrado
    },
    cardButtonText: {
        color: '#FFFFFF', // Texto blanco para contraste
        fontSize: 16, // Tamaño de fuente legible para el botón
        fontWeight: '500', // Peso seminegrita para texto del botón
    },


    modalText: {
        paddingBottom: 35,
        fontSize: 18,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'lightgrey',
        padding: 10,
        borderRadius: 50,
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fc034e',
        padding: 10,
        borderRadius: 50,
    },


    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: '40%', // Asegura que los botones tengan un ancho mínimo decente
    },
    buttonClose: {
        backgroundColor: "#fc034e",
    },
    buttonCancel: {
        backgroundColor: "#adacac",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },

});



export default PatientCard;