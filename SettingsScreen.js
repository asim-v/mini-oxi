import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { TextInput, Button, Switch, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [specificDeviceName, setSpecificDeviceName] = useState('');
  const [rediscoverDeviceRate, setRediscoverDeviceRate] = useState('');
  const [initialDeviceMessage, setInitialDeviceMessage] = useState('');
  const [reconnectionAttempts, setReconnectionAttempts] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const setDefaultValues = () => {
    setSpecificDeviceName('ESP32_BT');
    setRediscoverDeviceRate('10000');
    setInitialDeviceMessage('1');
    setReconnectionAttempts('5000');
  };

  const loadSettings = async () => {
    try {
      const storedSpecificDeviceName = await AsyncStorage.getItem('specificDeviceName');
      const storedRediscoverDeviceRate = await AsyncStorage.getItem('rediscoverDeviceRate');
      const storedInitialDeviceMessage = await AsyncStorage.getItem('initialDeviceMessage');
      const storedReconnectionAttempts = await AsyncStorage.getItem('reconnectionAttempts');
      
      setSpecificDeviceName(storedSpecificDeviceName || 'ESP32_BT');
      setRediscoverDeviceRate(storedRediscoverDeviceRate || '10000');
      setInitialDeviceMessage(storedInitialDeviceMessage || '1');
      setReconnectionAttempts(storedReconnectionAttempts || '5000');
    } catch (error) {
      console.error('Failed to load the settings from storage', error);
      setDefaultValues();  // Set defaults if there's an error reading from storage
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('specificDeviceName', specificDeviceName);
      await AsyncStorage.setItem('rediscoverDeviceRate', rediscoverDeviceRate);
      await AsyncStorage.setItem('initialDeviceMessage', initialDeviceMessage);
      await AsyncStorage.setItem('reconnectionAttempts', reconnectionAttempts);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save the settings', error);
      alert('Failed to save settings');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title title="Settings" />
        <Card.Content>
          <TextInput
            label="Specific Device Name"
            value={specificDeviceName}
            onChangeText={setSpecificDeviceName}
            disabled={!isEditable}
            mode="outlined"
          />
          <TextInput
            label="Rediscover Device Rate (milliseconds)"
            value={rediscoverDeviceRate}
            onChangeText={setRediscoverDeviceRate}
            disabled={!isEditable}
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            label="Initial Device Message"
            value={initialDeviceMessage}
            onChangeText={setInitialDeviceMessage}
            disabled={!isEditable}
            mode="outlined"
          />
          <TextInput
            label="Reconnection Attempts (milliseconds)"
            value={reconnectionAttempts}
            onChangeText={setReconnectionAttempts}
            disabled={!isEditable}
            keyboardType="numeric"
            mode="outlined"
          />
          <View style={styles.switchContainer}>
            <Text>Enable Editing</Text>
            <Switch value={isEditable} onValueChange={() => setIsEditable(!isEditable)} />
          </View>
          <Button mode="contained" onPress={saveSettings} disabled={!isEditable}>
            Save Settings
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  }
});

export default SettingsScreen;
