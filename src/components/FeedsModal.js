import React from 'react';
import { StyleSheet, View, Text, TouchableHighlight, Alert, Switch, Animated, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import LinearGradient from 'react-native-linear-gradient';
import {
  sources as allSources,
  grey,
  lightGrey,
  blue,
} from '../lib/constants';
import { ddp } from '../lib/DDP';
import PosytModal from './PosytModal';
import bugsnag from '../lib/bugsnag';

const styles = StyleSheet.create({
  modal: {
    // flex: 1,
    // alignSelf: 'center',
    width: 200,
  },
  modalButton: {
    flex: 1,
    height: 50,
    // padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    flex: 0,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Rooney Sans',
    marginTop: 5,
  },
  modalSubText: {
    flex: 0,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Rooney Sans',
    marginTop: 4,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#eee',
  },
  scrollView: {
    height: 240,
  },
  scrollViewBottomPadding: {
    height: 50,
  },
  gradientWrap: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 50,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  bottomWrap: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingLeft: 15,
    paddingRight: 10,
    backgroundColor: 'white',
  },
});

class FeedsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sources: [...allSources],
      scrollY: new Animated.Value(0),
    };
    this.show = this.show.bind(this);
  }

  show(direction) {
    this.refs.feedsModal.show(direction);
  }

  toggle(source) {
    const sources = this.state.sources;
    const disabledSources = _.get(this.props, 'currentUser.profile.disabledSources', []);
    disabledSources.includes(source) ? _.pull(disabledSources, source) : disabledSources.push(source);
    this.setState({ sources: _.difference(allSources, disabledSources) });
    ddp.call("users/disabledSources/set", [disabledSources]).catch(err => {
      if (global.__DEV__) console.log("Error setting feeds:", err);
      this.setState({ sources }); // rollback
      Alert.alert('That\'s weird', 'We could not save this change to the server. Please try again later. The server is probably undergoing maintinence.')
      bugsnag.notify(err);
    });
  }

  toggleAll = (on) => {
    const disabledSources = on ? [] : allSources;
    this.setState({ sources: _.difference(allSources, disabledSources) });
    ddp.call("users/disabledSources/set", [disabledSources]).catch(err => {
      if (global.__DEV__) console.log("Error setting feeds:", err);
      this.setState({ sources }); // rollback
      Alert.alert('That\'s weird', 'We could not save this change to the server. Please try again later. The server is probably undergoing maintinence.')
      bugsnag.notify(err);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.currentUser || !nextProps.currentUser ||
      this.props.currentUser.profile.disabledSources !== nextProps.currentUser.profile.disabledSources) {
      const disabledSources = _.get(nextProps, 'currentUser.profile.disabledSources', []);
      this.setState({ sources: _.difference(allSources, disabledSources) });
    }
  }

  render() {
    const { sources, scrollY } = this.state;
    const toggledAny = sources.length > 0;

    const gradientAnim = {
      bottom: scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [50, 0],
        extrapolate: 'clamp',
      }),
    };

    return (
      <PosytModal key="feedsModal" ref="feedsModal" style={styles.modal} disableVerticalSwipe={true}>
        <View style={[styles.modalButton, { height: 60, paddingHorizontal: 5 }]}>
          <Text style={[styles.modalSubText, { fontWeight: '600' }]}>Change what you swipe</Text>
          <Text style={[styles.modalSubText, { fontWeight: '400' }]}>Tap to toggle feeds off/on</Text>
        </View>
        <View style={styles.modalSeparator} />
        <ScrollView
          style={styles.scrollView}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }]
          )}
        >
          {allSources.map(source => {
            const active = sources.includes(source);
            return (
              <View key={source}>
                <TouchableHighlight style={[styles.modalButton]} onPress={() => this.toggle(source)} underlayColor={lightGrey}>
                  <Text style={[styles.modalText, !active && { color: grey }]}>{source}</Text>
                </TouchableHighlight>
                <View style={styles.modalSeparator} />
              </View>
            );
          })}
        </ScrollView>
        <Animated.View style={[styles.gradientWrap, gradientAnim]} pointerEvents="none">
          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
            style={styles.gradient}
            pointerEvents="none"
          />
        </Animated.View>
        <View style={styles.bottomWrap}>
          <Text style={[styles.modalSubText, { fontWeight: '600', fontSize: 12 }]}>Toggle all feeds {toggledAny ? 'off' : 'on'}</Text>
          <Switch onValueChange={this.toggleAll} value={toggledAny} onTintColor={blue} style={{ transform: [{scale: 0.7}] }} />
        </View>
      </PosytModal>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })(FeedsModal);
