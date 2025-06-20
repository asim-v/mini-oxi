import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Navbar from './Components/Navbar/navbar';
import Inicio from './Components/Inicio/Inicio';
import Protocolos from './Components/Protocolos/Protocolos';
import LinearGradient from 'react-native-linear-gradient';
import PatientList from './Components/Pacientes/Pacientes';
// import TargetSelector from './Components/Estimulacion/TargetSelector';
import Settings from './Components/Configuracion/Settings';
import { store, persistor } from './redux/store';
import { Provider } from 'react-redux';
import ProgressContainer from './Components/Estimulacion/ProgressContainer';
// import FullscreenTest from './Components/Estimulacion/FullScreenTest';
import { BluetoothProvider } from './BluetoothContext'; // Ajusta la ruta según corresponda
import { BlurView } from '@react-native-community/blur';

// import AnimatedLoader from 'react-native-animated-loader';
import LoaderOverlay from './animations/LoaderOverlay';


function App() {
  const [selectedWindow, setSelectedWindow] = useState('Inicio');
  const [isAnimated, setIsAnimated] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);



  // Detecta cambios en la orientación
  const [isPortrait, setIsPortrait] = useState(true);
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setIsPortrait(height > width);
    };

    Dimensions.addEventListener('change', updateOrientation);
    updateOrientation(); // Llama al inicio para establecer el estado inicial
  }, []);

  const onSessionPress = (data) => {
    setSelectedSession(data); // Almacena la sesión seleccionada
    setSelectedWindow('Estimulación'); // Cambia la ventana a Estimulación
  };

  const renderContent = () => {
    switch (selectedWindow) {
      case 'Inicio':
        return <ScrollView><Inicio onSessionPress={onSessionPress} /></ScrollView>;
      case 'Protocolos':
        return <ScrollView><Protocolos /></ScrollView>;
      case 'Pacientes':
        return <ScrollView><PatientList /></ScrollView>;
      case 'Estimulación':
        return <><LoaderOverlay /><ProgressContainer isAnimated={isAnimated} setIsAnimated={setIsAnimated} selectedSession={selectedSession} /></>
      case 'Configuracion':
        return <Settings />

      default:
        return null;
    }
  }

  return (
    <Provider store={store}>
      <BluetoothProvider>

        <LinearGradient
          colors={['hsl(213, 64%, 59%)', 'hsl(213, 64%, 70%)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Navbar onSelectionChange={setSelectedWindow} isLocked={isAnimated} selected={selectedWindow} />
            <View style={styles.content}>

              {renderContent()}
            </View>

            {isPortrait && (
              <View style={styles.centeredView}>
                <BlurView

                  style={styles.blurView}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="white"
                >
                  <Text style={styles.modalText}>Por favor, utiliza la aplicación en modo horizontal.</Text>
                </BlurView>
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>
      </BluetoothProvider>


    </Provider>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',


  },
  content: {
    flex: 1,
    marginTop: 25,
    marginRight: 25,
    marginBottom: 25,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderColor: '#F5F5F5',
    borderWidth: 3,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blurView: {
    width: '100%',
    height: '100%',

    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center", // Asegura el centrado vertical en Android
    justifyContent: 'center', // Para centrar en contenedores flex
    alignItems: 'center', // Para centrar en contenedores flex
    fontSize: 20, // Ajusta al tamaño deseado
    color: 'black', // Ajusta al color deseado
    fontWeight: 'bold', // Ajusta al peso deseado


  }

});


export default App;
