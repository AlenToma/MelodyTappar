import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Screen from './components/game/Screen';
import Game from './components/game/Game';
import { AppContext, InfoBeholder } from './types';
import objectUsestate from '@alentoma/usestate'
import Context from './AppContext';
import GlobalState from './objects/GlobalState';


export default function App() {
  const state = objectUsestate<AppContext>({
    windowSize: {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height
    }
  }, true)


  return (
    <Context.Provider value={state}>
      <View style={styles.container}>
        <Game />
      </View>
    </Context.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
