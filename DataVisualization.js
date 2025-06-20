import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useBluetooth } from './BluetoothContext';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { calculateSPO2AndBPM } from './visualizationUtils';
import Chip from './Chip';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Canvas, Path } from '@shopify/react-native-skia';

import { MAX_BUFFER } from './BluetoothContext';  // ya no lo declaras local
const WINDOW_SIZE = 50;  // 10 s visibles

export default function DataVisualization() {
  /* ------------------------------------------------------ */
  /* Estado visible                                         */
  /* ------------------------------------------------------ */
  const [, force] = useState(0);          // fuerza repintado (1 cada frame)
  const [hr, setHr] = useState(0);
  const [spo2, setSpo2] = useState(0);

  /* ------------------------------------------------------ */
  /* Refs: no disparan renders                              */
  /* ------------------------------------------------------ */
  const { dataRef, needsRenderRef } = useBluetooth();     // 🔄 llega directo del provider
  const calcCntRef = useRef(0);
  const sessionDataRef = useRef([]);
  const saveDataRef = useRef(false);
  const sessionIdRef = useRef(null);
  const frameRef = useRef(null);
  const pathIR = useRef('');
  const pathRed = useRef('');

  /* ------------------------------------------------------ */
  /* Constantes de dibujo                                   */
  /* ------------------------------------------------------ */
  const width = Dimensions.get('window').width - 100;
  const height = 220;

  /* ------------------------------------------------------ */
  /* Utilidades                                             */
  /* ------------------------------------------------------ */
  const buildPath = useCallback(
    (vals) => {
      if (!vals.length) return '';
      const step = width / (WINDOW_SIZE - 1);
      let p = `M0 ${height - vals[0]}`;
      for (let i = 1; i < vals.length; i++) {
        p += ` L${i * step} ${height - vals[i]}`;
      }
      return p;
    },
    [width, height]
  );

  const calcFS = useCallback((buf) => {
    if (buf.length < 2) return 0;
    const intv = buf.slice(1).map((d, i) =>
      new Date(d.timestamp) - new Date(buf[i].timestamp)
    );
    const avg = intv.reduce((s, v) => s + v, 0) / intv.length;
    return 1000 / avg;
  }, []);

  /* ------------------------------------------------------ */
  /* Procesa ventana y actualiza paths + HR/SPO2            */
  /* ------------------------------------------------------ */
  const processBuffer = useCallback(
    (buf) => {
      const recent = buf.slice(-WINDOW_SIZE);
      const irVals = recent.map((d) => d.ir).filter(Number.isFinite);
      const redVals = recent.map((d) => d.red).filter(Number.isFinite);
      const all = [...irVals, ...redVals];
      if (!all.length) return;

      const min = Math.min(...all);
      const max = Math.max(...all);
      const scale = max === min ? 1 : height / (max - min);

      pathIR.current = buildPath(irVals.map((v) => (v - min) * scale));
      pathRed.current = buildPath(redVals.map((v) => (v - min) * scale));
      force((t) => t + 1);                         // repinta Canvas

      if (++calcCntRef.current >= 10) {           // 1 vez/seg @10 Hz
        calcCntRef.current = 0;
        if (irVals.length && redVals.length) {
          const fs = calcFS(recent);
          const { SPO2, BPM } = calculateSPO2AndBPM(irVals, redVals, fs);
          setHr(BPM);
          setSpo2(SPO2);
          if (saveDataRef.current) sessionDataRef.current.push(...recent);
        }
      }
    },
    [buildPath, calcFS]
  );

  /* ------------------------------------------------------ */
  /* Bucle de animación alineado a vsync                    */
  /* ------------------------------------------------------ */
  useEffect(() => {
    const loop = () => {
      if (needsRenderRef.current && dataRef.current.length) {
        processBuffer(dataRef.current);
        needsRenderRef.current = false;
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [processBuffer, dataRef]);

  /* ------------------------------------------------------ */
  /* Guardado de sesión                                     */
  /* ------------------------------------------------------ */
  const saveSession = useCallback(async () => {
    if (sessionIdRef.current && sessionDataRef.current.length) {
      try {
        await AsyncStorage.setItem(
          sessionIdRef.current,
          JSON.stringify(sessionDataRef.current)
        );
      } catch (err) {
        console.error('AsyncStorage error:', err);
      }
    }
  }, []);

  const toggleSave = () => {
    saveDataRef.current = !saveDataRef.current;
    if (saveDataRef.current) {
      sessionIdRef.current = `session-${Date.now()}`;
      sessionDataRef.current = [];
    } else {
      saveSession();
      sessionIdRef.current = null;
    }
  };

  /* ------------------------------------------------------ */
  /* Render                                                 */
  /* ------------------------------------------------------ */
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Oxímetro</Title>

          {pathIR.current || pathRed.current ? (
            <Canvas style={{ width, height }}>
              <Path path={pathIR.current} color="#3f51b5" strokeWidth={2} style="stroke" />
              <Path path={pathRed.current} color="#f44336" strokeWidth={2} style="stroke" />
            </Canvas>
          ) : (
            <Paragraph>No hay datos disponibles</Paragraph>
          )}

          <View style={styles.dataContainer}>
            <Chip text={`HR: ${hr.toFixed(0)} bpm`} style={styles.chip} />
            <Chip text={`SPO₂: ${spo2.toFixed(1)} %`} style={styles.chip} />
          </View>

          <Button
            mode="contained"
            onPress={toggleSave}
            style={[styles.button, saveDataRef.current && styles.buttonStop]}
          >
            {saveDataRef.current ? 'Detener Grabación' : 'Iniciar Grabación'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

/* -------------------------------------------------------- */
/* Estilos                                                  */
/* -------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8eaf6' },
  card: { width: '90%', elevation: 5, borderRadius: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 10, textAlign: 'center', color: '#3f51b5' },
  dataContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  chip: { marginHorizontal: 5 },
  button: { marginTop: 20, backgroundColor: '#b5c0ff' },
  buttonStop: { backgroundColor: '#deb5ff' },
});
