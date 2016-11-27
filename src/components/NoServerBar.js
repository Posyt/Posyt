import React from 'react';
import { StyleSheet, View, Text, Dimensions, StatusBar } from 'react-native';
import { connect } from 'react-redux';
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

class NoServerBar extends React.Component {
  render() {
    const { connecting, connected } = this.props;
    if (connected || connecting) return null;
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text style={styles.text}>
          Posyt server unavailable 🙊
        </Text>
      </View>
    );
  }
}


NoServerBar.propTypes = {
  connecting: React.PropTypes.bool.isRequired,
  connected: React.PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    connecting: state.ddp.connecting,
    connected: state.ddp.connected,
  };
}

export default connect(mapStateToProps)(NoServerBar);
