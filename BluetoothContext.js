

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export const MAX_BUFFER = 300;
export const needsRenderRef = React.createRef();
needsRenderRef.current = false;
/**
 * BLE implementation of the previous BluetoothProvider
 * Library: react-native-ble-plx (>= 3.x)
 * Remember to add the required Android permissions in AndroidManifest.xml and
 * ask for them at runtime (handled below).
 */

const BluetoothContext = createContext();
export const useBluetooth = () => useContext(BluetoothContext);

// Create a single BleManager instance for the whole app
const bleManager = new BleManager();

export const BluetoothProvider = ({ children }) => {
  /** ----------------------------------
   * State
   * ----------------------------------*/
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const dataRef = useRef([]);
  const [, setPing] = useState(0);
  const [dataCount, setDataCount] = useState(0);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Keep the notification subscription so we can remove it on unmount
  const notificationSubRef = useRef(null);

  /**
   * Configuration – replace UUIDs with the ones from your ESP32 sketch
   */
  const config = {
    specificDeviceName: 'XIAO_ESP32S3_Oximeter',
    serviceUUID: '12345678-1234-1234-1234-1234567890ab',
    charIR_UUID: 'abcdef01-1234-1234-1234-1234567890ab',
    charRED_UUID: 'abcdef02-1234-1234-1234-1234567890ab',
    initialDeviceMessage: '1',
    rediscoverDeviceRate: 1000,
    reconnectionAttempts: 5000,
  };

  const findNotifyCharacteristic = async (device) => {
    const services = await device.services();
    for (const service of services) {
      const characteristics = await device.characteristicsForService(service.uuid);
      for (const char of characteristics) {
        if (char.isNotifiable) {
          console.log(`🟢 Found NOTIFY char:
  Service UUID: ${service.uuid}
  Characteristic UUID: ${char.uuid}`);
          return { serviceUUID: service.uuid, notifyCharacteristicUUID: char.uuid };
        }
      }
    }
    console.warn('❌ No NOTIFY characteristic found');
    return null;
  };




  /** ----------------------------------
   * Permissions (Android 12+ need BLUETOOTH_SCAN & CONNECT)
   * ----------------------------------*/
  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const permissions = Platform.Version >= 31
        ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Needed by some OEMs
        ]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      return Object.values(results).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
    } catch (err) {
      console.error('Permission request error:', err);
      Alert.alert('Error', 'No se otorgaron los permisos de Bluetooth.');
      return false;
    }
  }, []);

  /** ----------------------------------
   * Scanning & Discovery
   * ----------------------------------*/
  const discoverDevices = useCallback(async () => {
    if (connectedDevice || isConnecting || isDiscovering) return;

    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) return;

    setIsDiscovering(true);
    console.log('Scanning for BLE devices…');

    // Clear any previous scan
    bleManager.stopDeviceScan();

    bleManager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
      if (error) {
        console.error('❌ Scan error:', error);
        setIsDiscovering(false);
        return;
      }

      if (device?.name) {
        console.log(`🔍 Dispositivo detectado: ${device.name} (${device.id})`);
      }

      if (device?.name === config.specificDeviceName) {
        console.log(`✅ Encontrado ${device.name} (${device.id})`);
        bleManager.stopDeviceScan();
        setDevices([device]);
        connectToDevice(device.id);
      }
    });


    // Stop scan after 8 seconds if nothing found
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsDiscovering(false);
    }, 8000);
  }, [connectedDevice, isConnecting, isDiscovering, requestPermissions]);

  /** ----------------------------------
   * Connection / Reconnection
   * ----------------------------------*/

  /*******************************
   * 1) FUNCIÓN PARA ENCONTRAR LA
   *    CHARACTERISTIC “WRITE”
   *******************************/
  const findWriteCharacteristic = async (device) => {
    const services = await device.services();
    for (const service of services) {
      const characteristics = await device.characteristicsForService(service.uuid);
      for (const char of characteristics) {
        // isWritableWithResponse → la mayoría de firmwares ESP32 usan “write-with-response”
        if (char.isWritableWithResponse) {
          console.log(`✍️  Found WRITE char:
  Service UUID: ${service.uuid}
  Characteristic UUID: ${char.uuid}`);
          return { serviceUUID: service.uuid, writeCharacteristicUUID: char.uuid };
        }
      }
    }
    console.warn('⚠️  No WRITE characteristic found, usaré la del config.');
    return null; // devolvemos null si no encontramos nada
  };
  // ───── arriba del componente / provider ─────
  const lastPairRef = useRef({
    ts: 0,      // se actualiza cuando llega el primer canal
    ir: null,   // voltaje IR
    red: null,  // voltaje RED
  });

  // ───── función handleBinary revisada ─────
  const handleBinary = (characteristic, channel) => {
    if (!characteristic?.value) return;

    // 1. Decodifica el uint16 bruto
    const buf = Buffer.from(characteristic.value, 'base64');
    if (buf.length !== 2) return;                 // descarta paquetes corruptos
    const raw = buf.readUInt16LE(0);             // LSB primero
    const volt = raw * 5 / 524287;                // escala a voltios

    // 2. Completa el par
    const pair = lastPairRef.current;
    pair[channel] = volt;
    if (pair.ts === 0) pair.ts = Date.now();      // marca timestamp del *primer* canal

    // 3. ¿Tenemos ambos canales?
    const ready = pair.ir !== null && pair.red !== null;
    if (ready) {
      dataRef.current.push({ ...pair });          // empuja muestra completa
      if (dataRef.current.length > MAX_BUFFER) dataRef.current.shift();

      // reinicia el contenedor para el siguiente par
      lastPairRef.current = { ts: 0, ir: null, red: null };

      // ping visualización
      setPing(p => p ^ 1);
      needsRenderRef.current = true;
    }
  };


  const connectToDevice = useCallback(async (deviceId) => {
    if (isConnecting || connectedDevice?.id === deviceId) return;

    setIsConnecting(true);
    try {
      // 1. Conexión y descubrimiento
      const device = await bleManager.connectToDevice(deviceId, { autoConnect: true });
      setConnectedDevice(device);                                  // evita re-scans
      console.log('Conectado a', device.name);
      await device.discoverAllServicesAndCharacteristics();

      // 2. Limpia suscripciones anteriores
      notificationSubRef.current?.forEach(unsub => unsub.remove?.());
      notificationSubRef.current = [];

      // 3. Suscripción IR
      notificationSubRef.current.push(
        bleManager.monitorCharacteristicForDevice(
          device.id,
          config.serviceUUID,
          config.charIR_UUID,
          (err, c) => handleBinary(c, 'ir')   // etiqueta canal
        )
      );

      // 4. Suscripción RED
      notificationSubRef.current.push(
        bleManager.monitorCharacteristicForDevice(
          device.id,
          config.serviceUUID,
          config.charRED_UUID,
          (err, c) => handleBinary(c, 'red')  // etiqueta canal
        )
      );

      // 5. Busca characteristic WRITE (si la hay) y envía "1"
      const writeInfo = await findWriteCharacteristic(device);

      if (writeInfo) {
        const msg = Buffer
          .from(`${config.initialDeviceMessage}\r\n`, 'ascii')
          .toString('base64');

        await bleManager.writeCharacteristicWithResponseForDevice(
          device.id,
          writeInfo.serviceUUID,
          writeInfo.writeCharacteristicUUID,
          msg
        );
      } else {
        console.log('ℹ️  No WRITE characteristic; se omite mensaje inicial.');
      }


      // 6. Desconexión y limpieza
      device.onDisconnected(() => {
        console.log('Device disconnected');
        setConnectedDevice(null);
        notificationSubRef.current?.forEach(unsub => unsub.remove?.());
        notificationSubRef.current = [];
        setTimeout(() => connectToDevice(deviceId), config.reconnectionAttempts);
      });

    } catch (err) {
      console.error('Connection error:', err);
      setTimeout(() => connectToDevice(deviceId), config.reconnectionAttempts);
    } finally {
      setIsConnecting(false);
    }
  }, [connectedDevice, isConnecting]);


  /** ----------------------------------
   * Background rediscovery if disconnected
   * ----------------------------------*/
  useEffect(() => {
    const interval = setInterval(() => {
      if (!connectedDevice) discoverDevices();
    }, config.rediscoverDeviceRate);
    return () => clearInterval(interval);
  }, [connectedDevice, discoverDevices]);

  /** ----------------------------------
   * Cleanup on unmount
   * ----------------------------------*/
  useEffect(() => {
    return () => {
      notificationSubRef.current?.remove();
      bleManager.destroy();
    };
  }, []);

  /** ----------------------------------
   * Provider value
   * ----------------------------------*/
  return (
    <BluetoothContext.Provider value={{
      devices,
      connectedDevice,
      dataRef,
      needsRenderRef,
      discoverDevices,
      connectToDevice,
      isDiscovering,
      isConnecting,
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export default BluetoothContext;
