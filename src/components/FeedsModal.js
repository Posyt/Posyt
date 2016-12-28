import React from 'react';
import { StyleSheet, View, Text, TouchableHighlight, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import LinearGradient from 'react-native-linear-gradient';
import {
  sources as allSources,
  grey,
  lightGrey,
} from '../lib/constants';
import { ddp } from '../lib/DDP';
import PosytModal from './PosytModal';

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
    height: 290,
  },
  scrollViewBottomPadding: {
    height: 50,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
});

class FeedsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sources: [...allSources],
    };
    this.show = this.show.bind(this);
  }

  show(direction) {
    this.refs.feedsModal.show(direction);
  }

  save(source) {
    let sources = this.state.sources;
    const active = sources.includes(source);
    sources = _.compact(active ? _.pull(sources, source) : [...sources, source]);
    this.setState({ sources });
    ddp.call("users/sources/set", [sources]).catch(err => {
      if (global.__DEV__) console.log("Error setting feeds:", err);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.currentUser || !nextProps.currentUser || this.props.currentUser.profile.sources !== nextProps.currentUser.profile.sources) this.setState({ sources: nextProps.currentUser && nextProps.currentUser.profile && nextProps.currentUser.profile.sources || allSources })
  }

  render() {
    const { sources } = this.state;
    return (
      <PosytModal key="feedsModal" ref="feedsModal" style={styles.modal} disableVerticalSwipe={true}>
        <View style={[styles.modalButton, { height: 60, paddingHorizontal: 5 }]}>
          <Text style={[styles.modalSubText, { fontWeight: '600' }]}>Change what you swipe</Text>
          <Text style={[styles.modalSubText, { fontWeight: '400' }]}>Tap to toggle feeds off/on</Text>
        </View>
        <View style={styles.modalSeparator} />
        <ScrollView style={styles.scrollView}>
          {allSources.map(source => {
            const active = sources.includes(source);
            return (
              <View key={source}>
                <TouchableHighlight style={[styles.modalButton]} onPress={() => this.save(source)} underlayColor={lightGrey}>
                  <Text style={[styles.modalText, !active && { color: grey }]}>{source}</Text>
                </TouchableHighlight>
                <View style={styles.modalSeparator} />
              </View>
            );
          })}
          <View style={styles.scrollViewBottomPadding} />
        </ScrollView>
        <LinearGradient
          start={[0, 0]}
          end={[0, 1]}
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          style={styles.gradient}
          pointerEvents="none"
        />
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
