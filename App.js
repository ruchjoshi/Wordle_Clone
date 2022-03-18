//import {React, useState, useEffect} from 'react';
//import {Button} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Alert } from 'react-native';
import { colors, CLEAR, ENTER, colorsToEmoji } from "./src/constants";
import Keyboard from "./src/components/Keyboard";
import * as Clipboard from "expo-clipboard";
import JSONdata from './wordle_dict.json';
import Game from './src/components/Game';

export default function App(){
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>WORDLE</Text>

      <Game/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
  },
  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 7,
  },

});
