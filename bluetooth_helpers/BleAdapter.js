// bluetooth/BleAdapter.js
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export default class BleAdapter {
  constructor(cfg) {
    this.cfg = cfg;
    this.ble = new BleManager();
    this.device = null;
    this.sub = null;
  }

  async init() {
    // iOS no necesita permisos extra; Android >= 31 sí:
    // BLUETOOTH_SCAN / CONNECT ya gestionados por RN-BLE-PLX ≥ 2.0
  }

  async scanAndConnect(onData) {
    return new Promise((resolve, reject) => {
      const scan = this.ble.startDeviceScan(
        null, null,
        async (err, dev) => {
          if (err) { scan.remove(); return reject(err); }
          if (dev.name === this.cfg.deviceName) {
            scan.remove();
            try {
              this.device = await dev.connect();
              await this.device.discoverAllServicesAndCharacteristics();
              const { serviceUUID, charUUID } = this.cfg;
              this.sub = this.device.monitorCharacteristicForService(
                serviceUUID, charUUID,
                (e, char) => {
                  if (e) return console.warn(e);
                  onData(Buffer.from(char.value, 'base64').toString('utf8'));
                }
              );
              resolve();
            } catch (e) { reject(e); }
          }
        }
      );
    });
  }

  async write(msg) {
    const data = Buffer.from(msg).toString('base64');
    return this.device.writeCharacteristicWithResponseForService(
      this.cfg.serviceUUID, this.cfg.charUUID, data
    );
  }

  async disconnect() { this.sub?.remove(); await this.device?.cancelConnection(); }
  isConnected() { return !!this.device; }
}
