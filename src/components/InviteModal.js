import React from 'react';
import { StyleSheet, View, Text, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import {
  grey,
  lightGrey,
} from '../lib/constants';
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
    height: 230,
  },
});

class InviteModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.show = this.show.bind(this);
  }

  show(direction) {
    this.refs.reachModal.show(direction);
  }

  componentWillReceiveProps(nextProps) {
    // if (!this.props.currentUser || !nextProps.currentUser || this.props.currentUser.profile.sources !== nextProps.currentUser.profile.sources) this.setState({ sources: nextProps.currentUser && nextProps.currentUser.profile && nextProps.currentUser.profile.sources || SOURCES })
  }

  render() {
    const { sources } = this.state;
    return (
      <PosytModal key="reachModal" ref="reachModal" style={styles.modal}>
        <View style={[styles.modalButton, { height: 60, paddingHorizontal: 5 }]}>
          <Text style={[styles.modalSubText, { fontWeight: '600' }]}>Send Invites</Text>
          <Text style={[styles.modalSubText, { fontWeight: '400' }]}>Spread Posyt, Earn Virality</Text>
        </View>
        <View style={styles.modalSeparator} />
        <TouchableHighlight style={[styles.modalButton]} onPress={console.log} underlayColor={lightGrey}>
          <Text style={[styles.modalText, { color: grey }]}>Wat</Text>
        </TouchableHighlight>
      </PosytModal>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })(InviteModal);
