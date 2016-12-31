import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {
  topCardExpanded,
  topCardContracted,
} from '../lib/actions.js';
import LinkifyText from './LinkifyText';
import { connect } from 'react-redux';
import Shimmer from 'react-native-shimmer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    fontFamily: 'Rooney Sans',
    fontWeight: '600',
    fontSize: 44,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  content: {
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 22,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 26,
    textAlign: 'center',
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
    left: 0,
    textAlign: 'center',
    fontFamily: 'Rooney Sans',
    fontWeight: '200',
    fontSize: 16,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 14,
    backgroundColor: 'transparent',
    opacity: 0.7,
  },
});

class CardIntro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onPress.bind(this);
  }

  onPress() {
  }

  render() {
    const { intro } = this.props;
    return (
      <View style={styles.container}>
        <Shimmer direction={intro.shimmerDirection || 'right'} pauseDuration={0} speed={intro.shimmerSpeed || 100} animationOpacity={0.2} style={styles.heroShimmer}>
          <Text style={styles.hero}>{intro.hero}</Text>
        </Shimmer>
        {intro.content && (
          <LinkifyText style={styles.content}
            onOpenURL={() => this.props.dispatch(topCardExpanded())}
            onCloseURL={() => this.props.dispatch(topCardContracted())}
          >{intro.content}</LinkifyText>
        )}
        <View style={styles.bottom}>
          <Text style={styles.sources}>{intro.step}</Text>
        </View>
      </View>
    );
  }
}
CardIntro.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  intro: React.PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })(CardIntro);
