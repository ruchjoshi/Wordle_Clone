import {React, useState, useEffect} from 'react';
import {Button} from 'react-native';
import { StyleSheet, Text, View, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, CLEAR, ENTER, colorsToEmoji } from "../../constants";
import Keyboard from "../Keyboard";
import * as Clipboard from "expo-clipboard";
import JSONdata from '../../../wordle_dict.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NUMBER_OF_TRIES = 6;

const copyArray = (arr) => {
  return [...arr.map((rows) => [...rows])];
};

//const wordOfTheDay = JSONdata[Math.floor(Math.random()*4000)].Word;

var letters = JSONdata[Math.floor(Math.random()*500)].Word.split("");


const Game = () => {

  const [rows, setRows] = useState(
    new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill(""))
  );
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState("playing"); // won, lost, playing
  const [loaded, setLoaded] = useState(false);
  const [word, setWord] = useState(letters);


  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow]);

  useEffect(()=>{
    persistState();
  },[rows, curRow, curCol, gameState])

  useEffect(()=>{
    readState();
  },[])

  const persistState = async () => {
    data = {
      rows,
      curRow,
      curCol,
      gameState,
      word
    };
    const dataString = JSON.stringify(data);
    await AsyncStorage.setItem('@game', dataString);

    console.log(typeof dataString);
    console.log(dataString);
  }

  const readState = async () => {
    const dataString = await AsyncStorage.getItem('@data');
    try{
      const data = JSON.parse(dataString);
      setRows(data.rows);
      setCurCol(data.curCol);
      setCurRow(data.curRow);
      setGameState(data.gameState);
      setWord(data.word);
    }
    catch(e){
      console.log('Data parsing error');
    }
    setLoaded(true);
  }

  const checkGameState = () => {
    if (checkIfWon() && gameState !== "won") {
      Alert.alert("Huraaay", "You won!", [
        {text: "OK", onPress: () => {console.log ("OK pressed")}},
        { text: "Share", onPress: shareScore },
      ]);
      setGameState("won");
    } else if (checkIfLost() && gameState !== "lost") {
      Alert.alert("Meh", "Try again tomorrow!");
      setGameState("lost");
    }
  };

  const shareScore = () => {
    const textMap = rows.map((row, i) => row.map((cell, j) => colorsToEmoji[getCellBGColor(i, j)]).join(""))
    .filter((row) => row).join("\n");
    const textToShare = `Wordle \n${textMap}`;
    Clipboard.setString(textToShare);
    Alert.alert("Copied successfully", "Share your score on your social media");
  };

  const checkIfWon = () => {
    const row = rows[curRow - 1];

    return row.every((letter, i) => letter === letters[i]);
  };

  const checkIfLost = () => {
    return !checkIfWon() && curRow === rows.length;
  };

  const onKeyPressed = (key) => {
      if (gameState !== "playing") {
        return;
      }

      const updatedRows = copyArray(rows);

      if (key === CLEAR) {
        const prevCol = curCol - 1;
        if (prevCol >= 0) {
          updatedRows[curRow][prevCol] = "";
          setRows(updatedRows);
          setCurCol(prevCol);
        }
        return;
      }

      if (key === ENTER) {
        if (curCol === rows[0].length) {
          setCurRow(curRow + 1);
          setCurCol(0);
        }

        return;
      }

      if (curCol < rows[0].length) {
        updatedRows[curRow][curCol] = key;
        setRows(updatedRows);
        setCurCol(curCol + 1);
      }
  };

  const isCellActive = (row, col) => {
    return row === curRow && col === curCol;
  };

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];

    if (row >= curRow) {
      return colors.black;
    }
    if (letter === letters[col]) {
      return colors.primary;
    }
    if (letters.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  };

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    );
  };

  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);

  if(!loaded){
    return(<ActivityIndicator />);
  }

  const newGame = ()=> {
    console.log('restart');
    setRows(new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill("")));
    setCurCol(0);
    setCurRow(0);
    setGameState('playing');
    setLoaded('false');
    letters = JSONdata[Math.floor(Math.random()*500)].Word.split("");
    setWord(letters);
    persistState();
    readState();
    }


  return (
    <>
      <ScrollView style={styles.map}>
        {rows.map((row, i) => (
          <View key={`row-${i}`} style={styles.row}>
            {row.map((letter, j) => (
              <View
                key={`cell-${i}-${j}`}
                style={[
                  styles.cell,
                  {
                    borderColor: isCellActive(i, j)
                      ? colors.grey
                      : colors.darkgrey,
                    backgroundColor: getCellBGColor(i, j),
                  },
                ]}
              >
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <Button title = 'New Game' onPress ={newGame}></Button>
      <Keyboard
        onKeyPressed={onKeyPressed}
        greenCaps={greenCaps} // ['a', 'b']
        yellowCaps={yellowCaps}
        greyCaps={greyCaps}
      />
      </>
  );
}

const styles = StyleSheet.create({

  map: {
    alignSelf: "stretch",
    marginVertical: 20,
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
  },
  cell: {
    borderWidth: 3,
    borderColor: colors.darkgrey,
    flex: 1,
    maxWidth: 70,
    aspectRatio: 1,
    margin: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    color: colors.lightgrey,
    fontWeight: "bold",
    fontSize: 28,
  },
});

export default Game;
