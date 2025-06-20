import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from './Avatar';

function Inicio({ onSessionPress }) {
    const [recentPatients, setRecentPatients] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Cargar sesiones recientes
                const storedRecentSessions = await AsyncStorage.getItem('timerSessions');
                const storedPatients = await AsyncStorage.getItem('patients');
                const patients = storedPatients ? JSON.parse(storedPatients) : [];
                const patientMap = new Map(patients.map(patient => [patient.id, patient]));

                if (storedRecentSessions) {
                    let parsedSessions = JSON.parse(storedRecentSessions);

                    // Ordenar sesiones por fecha de manera descendente
                    parsedSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

                    // Mapear sesiones a pacientes utilizando patientId
                    const sessionsWithPatients = parsedSessions.map(session => {
                        const patient = patientMap.get(session.patientId);
                        return { ...session, patient };
                    });

                    // Filtrar cualquier sesión que no tenga un paciente válido asociado
                    const validSessions = sessionsWithPatients.filter(session => session.patient);

                    setRecentSessions(validSessions.slice(0, 10)); // Opcional: limitar el número de sesiones mostradas

                    // Obtener los pacientes únicos de las sesiones válidas
                    const uniquePatients = Array.from(new Set(validSessions.map(session => session.patient)))
                        .slice(0, 10); // Opcional: limitar el número de pacientes mostrados

                    setRecentPatients(uniquePatients);
                }
            } catch (error) {
                console.error('Error loading data from AsyncStorage:', error);
            }
        };

        loadData();
    }, []);

    const handlePress = (session) => {
        onSessionPress(session);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Inicio</Text>
            <Text style={styles.title}>Pacientes Recientes</Text>
            {recentPatients.length === 0 && <Text>Aún no hay pacientes recientes</Text>}
            <View style={styles.recentPatients}>
                {recentPatients.map((patient, index) => (
                    <Avatar
                        key={index}
                        initials={patient.name[0]} // Asumiendo que 'name' es una cadena y no está vacía
                        color={patient.color} // Asegúrate de que tus pacientes tienen un campo 'color' o ajusta según sea necesario
                    />
                ))}
            </View>

            <Text style={styles.title}>Sesiones Recientes</Text>
            {recentSessions.length === 0 && <Text>Aún no hay sesiones registradas</Text>}
            {recentSessions.map((session, index) => (
                <View key={index} style={styles.session}>
                    <Text style={styles.duration}>{session.duration / 60 + ' minutos'}</Text>
                    <Text style={styles.name}>{session.patient?.name}</Text>
                    <Text style={styles.protocol}>{session.protocol.title}</Text>
                    <Text style={styles.date}>{new Date(session.date).toLocaleDateString()}</Text>
                    {/* <TouchableOpacity style={styles.sessionButton} onPress={() => handlePress(session)}>
                        <Text style={styles.sessionButtonText}>Ver sesión</Text>
                    </TouchableOpacity> */}
                </View>
            ))}
        </View>
    );
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,

    },
    header: {
        fontSize: 28, // Ajuste para mejorar la legibilidad
        fontWeight: '600', // Menos pesado que 'bold'
        color: '#333', // Color oscuro para texto, mejora la legibilidad
        marginBottom: 24, // Espaciado consistente
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 12, // Espaciado uniforme
        color: '#555', // Texto más suave
    },
    recentPatients: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    session: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0', // Color más suave para la línea
    },
    duration: {
        fontSize: 16,
        color: '#666', // Color de texto uniforme
    },
    name: {
        fontSize: 16,
        fontWeight: '500', // Semi-bold para nombres
        color: '#666',
    },
    protocol: {
        fontSize: 16,
        color: '#666',
    },
    date: {
        fontSize: 16,
        color: '#666',
    },
    sessionButton: {
        backgroundColor: '#b4fac6', // Color más vibrante para acciones
        color: '#054a17',
        padding: 8,
        borderRadius: 20, // Bordes más redondeados
        elevation: 2, // Sombra para botones (Android)
        shadowColor: '#000', // Sombras para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,

    },
    sessionButtonText: {
        color: '#168031', // Texto blanco para contrastar con el fondo
        fontSize: 14,
    },
    viewSessionsButton: {
        padding: 12,
        backgroundColor: '#E0E0E0', // Color más suave
        borderRadius: 20,
        alignItems: 'center',
        marginVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    viewSessionsText: {
        fontSize: 16,
        color: '#333', // Mejora la legibilidad
    },
    recommendationBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFEFB7',
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 20, // Añade espacio antes de la caja de recomendaciones
    },
    recommendationText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333', // Texto oscuro para mejor contraste
    }
});


export default Inicio;
