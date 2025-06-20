// bluetooth/ClassicAdapter.js
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export default class ClassicAdapter {
  constructor(cfg) { this.cfg = cfg; this.device = null; this.sub = null; }

  /* ————— INIT & PERMISOS ————— */
  async init() {
    if (Platform.OS === 'android') {
      const perms = Platform.Version >= 31
        ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
           PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      const res = await PermissionsAndroid.requestMultiple(perms);
      const granted = Object.values(res)
        .every(r => r === PermissionsAndroid.RESULTS.GRANTED);
      if (!granted) throw new Error('Permisos Classic denegados');
    }
    if (!(await RNBluetoothClassic.isBluetoothEnabled()))
      throw new Error('Bluetooth desactivado');
  }

  /* ————— ESCANEO & CONEXIÓN ————— */
  async scanAndConnect(onData) {
    const paired = await RNBluetoothClassic.getBondedDevices();
    const dev = paired.find(d => d.name === this.cfg.deviceName);
    if (!dev) throw new Error('Dispositivo SPP no emparejado');
    this.device = await RNBluetoothClassic.connectToDevice(dev.id);
    await this.device.write(this.cfg.initialMessage + '\r\n');
    this.sub = this.device.onDataReceived(evt => onData(evt.data));
  }

  /* ————— I/O ————— */
  async write(msg) { return this.device?.write(msg + '\r\n'); }
  async disconnect() { this.sub?.remove(); await this.device?.disconnect(); }

  /* ————— UTIL ————— */
  isConnected() { return !!this.device; }
}
