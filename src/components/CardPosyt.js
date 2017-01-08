import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import segment from '../lib/segment';
import {
  topCardExpanded,
  topCardContracted,
} from '../lib/actions.js';
import LinkifyText from './LinkifyText';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    fontFamily: 'Rooney Sans',
    fontWeight: '600',
    fontSize: 26,
    margin: 20,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: 100,
  },
  sources: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    textAlign: 'right',
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 16,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
});

class CardPosyt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onPress.bind(this);
  }

  onPress() {
  }

  render() {
    const { posyt } = this.props;
    return (
      <View style={styles.container}>
        <LinkifyText
          style={styles.content}
          onOpenURL={() => {
            this.props.dispatch(topCardExpanded());
            segment.track('Card Press Posyt URL', { _id: posyt._id, content: posyt.content });
          }}
          onCloseURL={() => this.props.dispatch(topCardContracted())}
        >
          {posyt.content}
        </LinkifyText>
        <LinearGradient
          style={styles.bottom}
          colors={['rgba(255,255,255,0)', 'white']}
        >
          <Text style={styles.sources}>Posyt</Text>
        </LinearGradient>
      </View>
    );
  }
}
CardPosyt.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  posyt: React.PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })(CardPosyt);
