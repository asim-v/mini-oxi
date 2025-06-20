import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';

function Navbar({ onSelectionChange, isLocked, selected }) {

  const items = [
    { name: 'Inicio', icon: 'home' },
    { name: 'Protocolos', icon: 'list' },
    { name: 'Pacientes', icon: 'user' },
    { name: 'Estimulación', icon: 'chevrons-right' },
  ];

  const selectedIndex = useSharedValue(items.findIndex(item => item.name === selected));

  const backgroundStyle = useAnimatedStyle(() => {
    const itemHeight = 46;
    const marginVertical = 10;
    const offsetInicial = 15;
    return {
      transform: [
        {
          translateY: withTiming(
            offsetInicial + selectedIndex.value * (itemHeight + marginVertical),
            {
              duration: 200,
            }
          ),
        },
      ],
    };
  });

  const handlePress = (name) => {
    if (isLocked) return; // Si está bloqueado, ignora el clic
    const index = items.findIndex(item => item.name === name);
    selectedIndex.value = index;
    if (onSelectionChange) {
      onSelectionChange(name);
    }
  };


  useEffect(() => {
    const newIndex = items.findIndex(item => item.name === selected);
    selectedIndex.value = newIndex;
    console.log('selectedIndex updated to', newIndex);
  }, [selected, items, selectedIndex]);

  console.log('selected', selected, selectedIndex.value)

  return (
    <View style={isLocked ? [styles.sidebar, styles.locked] : styles.sidebar}>
      <Animated.View style={[styles.background, backgroundStyle]} />
      {items.map((item, index) => (
        <TouchableOpacity key={item.name} onPress={() => handlePress(item.name)} disabled={isLocked}>
          <View style={selected === item.name ? styles.menuItemHighlighted : styles.menuItem}>
            <Icon name={item.icon} size={30} color={selected === item.name ? '#5490d9' : 'white'} />
            <Text style={selected === item.name ? styles.menuTextHighlighted : styles.menuText}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}





const styles = {
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 50, // Asegúrate de que este valor coincida con la altura de tus elementos de menú
    backgroundColor: '#ffffff',
    borderRadius: 10,
    top: 12.5,
    // Ajusta el padding y margin según sea necesario
  },
  meniIconHighlighted: {
    color: '#5490d9',
  },
  locked: {
    opacity: 0.5,
  },
  sidebar: {
    width: 200,  // Ajustado para dar espacio al texto
    //   justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
    margin: 25,
    borderRadius: 20,
  },
  menuItem: {
    flexDirection: 'row',  // Alinea horizontalmente el ícono y el texto
    marginBottom: 25,
    alignItems: 'center',
    paddingLeft: 10,  // Espacio desde el borde izquierdo

  },
  menuItemHighlighted: {
    flexDirection: 'row',
    marginBottom: 25,
    alignItems: 'center',
    paddingLeft: 10,
    // backgroundColor: '#ffffff',  // Fondo del ítem destacado
    borderRadius: 10,
    padding: 10,
  },
  menuText: {
    marginLeft: 10,  // Espacio entre el ícono y el texto
    fontSize: 16,   // Tamaño del texto
    color: 'white',  // Color del texto
  },
  menuTextHighlighted: {
    marginLeft: 10,
    fontSize: 16,
    color: '#5490d9',
    fontWeight: 'bold',  // Texto en negrita para el ítem destacado
  },
};


export default Navbar;
