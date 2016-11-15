'use strict';

import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Cards from '../components/Cards'
import Compose from '../components/Compose'

class ConnectScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.cards}>
          <Cards />
        </View>
        <View style={styles.compose}>
          <Compose />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cards: {
    flex: 1,
  },
  compose: {
    height: 76,
  },
})

export default ConnectScreen
