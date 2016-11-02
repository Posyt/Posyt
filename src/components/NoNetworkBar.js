import React from 'react';
import { StyleSheet, View, Text, Dimensions, StatusBar, NetInfo } from 'react-native';
import {
  gold,
} from '../lib/constants';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 20,
    width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: gold,
  },
  text: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Rooney Sans',
    marginTop: 0,
    backgroundColor: 'transparent',
  },
});

class NoNetworkBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: true,
    };
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
  }

  componentDidMount() {
    NetInfo.isConnected.fetch().then(this.handleConnectivityChange);
    NetInfo.isConnected.addEventListener(
      'change',
      this.handleConnectivityChange
    );
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      'change',
      this.handleConnectivityChange
    );
  }

  handleConnectivityChange(isConnected) {
    this.setState({ isConnected });
  }

  render() {
    const { isConnected } = this.state;
    if (isConnected) return null;
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text style={styles.text}>
          No internet 🙊
        </Text>
      </View>
    );
  }
}

export default NoNetworkBar;
