import AsyncStorage from '@react-native-async-storage/async-storage';


export const groupRecordingsByDate = (recordings) => {
    const grouped = recordings.reduce((acc, recording) => {
        const date = recording.date.split('T')[0];
        if (!acc[date]) {
            acc[date] = {
                date: date,
                recordings: []
            };
        }
        acc[date].recordings.push(recording);
        return acc;
    }, {});

    return Object.values(grouped);
};
export const handleDeleteAll = async () => {
    try {
        await AsyncStorage.clear();
        Alert.alert('Datos eliminados', 'Se han eliminado todos los datos.');
    } catch (error) {
        console.error('Error eliminando los datos', error);
    }
};

export const renderSessionItem = ({ item }) => (
    <View style={styles.sessionCard}>
        <Text style={styles.sessionText}>{item.name}</Text>
    </View>
);
