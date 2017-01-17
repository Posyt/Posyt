import React from 'react';
import { StyleSheet, View, Text, TouchableHighlight, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import Shimmer from 'react-native-shimmer';
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
    // alignItems: 'center',
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

class PointsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.show = this.show.bind(this);
  }

  show(direction) {
    this.refs.pointsModal.show(direction);
  }

  render() {
    const { currentUser } = this.props;
    const points = currentUser && currentUser.meta && currentUser.meta.points;
    return (
      <PosytModal key="pointsModal" ref="pointsModal" style={styles.modal}>
        <View style={[styles.modalButton, { height: 160, paddingLeft: 10, paddingRight: 10 }]}>
          <Shimmer pauseDuration={4500} speed={100} animationOpacity={0.4}>
            <Text style={[styles.modalSubText, { fontWeight: '600' }]}>{points} {points === 1 ? 'Point' : 'Points'}</Text>
          </Shimmer>
          <Shimmer pauseDuration={4500} speed={100} animationOpacity={0.4}>
            <Text style={[styles.modalSubText, { fontSize: 15, lineHeight: 18, marginTop: -3, fontWeight: '400', textAlign: 'left' }]}>Help your posyts reach more people 🎉</Text>
          </Shimmer>
          <Shimmer pauseDuration={4500} speed={100} animationOpacity={0.4}>
            <Text style={[styles.modalSubText, { fontWeight: '400', textAlign: 'right' }]}>✏️ write a posyt 👉 +1</Text>
          </Shimmer>
          <Shimmer pauseDuration={4500} speed={100} animationOpacity={0.4}>
            <Text style={[styles.modalSubText, { fontWeight: '400', textAlign: 'right' }]}>👍 get a like 👉 +1</Text>
          </Shimmer>
          <Shimmer pauseDuration={4500} speed={100} animationOpacity={0.4}>
            <Text style={[styles.modalSubText, { fontWeight: '400', textAlign: 'right' }]}>👮 get reported 👉 -1</Text>
          </Shimmer>
        </View>
        <View style={styles.modalSeparator} />
        <Shimmer pauseDuration={4500} speed={100} animationOpacity={0.4}>
          <Text style={[styles.modalSubText, { fontWeight: '400', paddingLeft: 5, paddingRight: 5, paddingTop: 10, paddingBottom: 10 }]}>
            Earn points to give your posyts a boost. Points make your posyts more visible in the hours right after you share them.
          </Text>
        </Shimmer>
      </PosytModal>
    )
    // <View style={styles.modalSeparator} />
    // <TouchableHighlight style={[styles.modalButton]} onPress={() => { this.refs.pointsModal.hide("left", () => this.props.showInviteModal("right")) }} underlayColor={lightGrey}>
    //   <Text style={[styles.modalText]}>Invite</Text>
    // </TouchableHighlight>
    // <View style={styles.modalSeparator} />
    // <TouchableHighlight style={[styles.modalButton]} onPress={console.log} underlayColor={lightGrey}>
    //   <Text style={[styles.modalText, { color: grey }]}>Wat</Text>
    // </TouchableHighlight>
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })(PointsModal);
