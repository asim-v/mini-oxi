import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment-timezone';

const RecordingSessions = () => {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const allKeys = await AsyncStorage.getAllKeys(); // Obtener todas las claves en AsyncStorage
            const sessionData = await AsyncStorage.multiGet(allKeys); // Obtener los valores asociados a esas claves

            // Mapear las sesiones para mostrar el número de puntos de datos y otros detalles
            const sessions = sessionData.map(([key, value]) => {
                const data = JSON.parse(value);
                const dataPoints = data.length;
                const startTime = formatTimestamp(data[0]?.timestamp || "N/A");
                const endTime = formatTimestamp(data[data.length - 1]?.timestamp || "N/A");
                return { sessionId: key, dataPoints, startTime, endTime };
            });

            setSessions(sessions);
        } catch (error) {
            console.error('Error loading sessions from AsyncStorage:', error);
        }
    };


    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "N/A";
    
        const date = moment(timestamp);
        if (!date.isValid()) return "N/A";
    
        // Convertir la hora a CST
        const cstDate = date.tz('America/Chicago');
    
        // Formatear la fecha y la hora
        const formattedDate = cstDate.format('DD-MM-YY');
        const formattedTime = cstDate.format('HH:mm CST');
    
        return `${formattedDate}        ${formattedTime}`;
    };
    

    const exportToCSV = async (sessionId) => {
        try {
            const sessionData = await AsyncStorage.getItem(sessionId);
            const data = JSON.parse(sessionData);

            // Convertir datos a CSV
            const csvContent = data.map(item => `${formatTimestamp(item.timestamp)},${item.ir},${item.red},${item.spo2},${item.hr}`).join('\n');
            const header = 'Timestamp,IR,Red,SPO2,HR\n';
            const csvData = header + csvContent;

            // Guardar CSV en el sistema de archivos
            const fileUri = FileSystem.documentDirectory + `${sessionId}.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csvData);

            // Compartir el archivo CSV
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export CSV',
                UTI: 'public.comma-separated-values-text',
            });

        } catch (error) {
            console.error('Error exporting session to CSV:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => exportToCSV(item.sessionId)}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.sessionText}>Session ID: {item.sessionId}</Text>
                    <Text style={styles.dataPointsText}>Data Points: {item.dataPoints}</Text>
                    <Text style={styles.timeText}>Start Time: {item.startTime}</Text>
                    <Text style={styles.timeText}>End Time: {item.endTime}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>Recording Sessions</Text> */}
            <FlatList
                data={sessions}
                keyExtractor={(item) => item.sessionId}
                renderItem={renderItem}
            />
            <Button
                mode="contained"
                onPress={loadSessions}
                style={styles.button}
            >
                Refrescar sesiones
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#3f51b5',
    },
    card: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#ffffff',
        elevation: 3,
        borderRadius: 8,
    },
    sessionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    dataPointsText: {
        fontSize: 14,
        color: '#666',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
    },
});

export default RecordingSessions;
