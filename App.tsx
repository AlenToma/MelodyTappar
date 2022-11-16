import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Screen from './components/game/Screen';
import Game from './components/game/Game';
import { AppContext, InfoBeholder } from './types';
import objectUsestate from '@alentoma/usestate'
import Context from './AppContext';
import GlobalState from './objects/GlobalState';
import { fontsLoader } from './ui/Icons';
import { WindowPropeties } from './objects/WindowPropeties';


export default function App() {
  const [loaded] = fontsLoader();
  const state = objectUsestate<AppContext>({
    windowSize: new WindowPropeties()
  }, true)


  if (!loaded)
    return null;

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
