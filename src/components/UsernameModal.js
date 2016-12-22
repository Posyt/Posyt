import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import {
  black,
  red,
  lightRed,
  appleGrey,
} from '../lib/constants';
import { ddp } from '../lib/DDP';
import PosytModal from './PosytModal';
import segment from '../lib/segment';


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
  modalRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
  },
  modalCol: {
    flexDirection: 'column',
  },
  modalIcon: {
    width: 22,
    height: 22,
    marginVertical: 2,
    tintColor: black,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#eee',
  },
  modalTextInput: {
    flex: 1,
    height: 50,
    textAlign: 'center',
  },
});

class UsernameModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.currentUser && props.currentUser.username || "",
      available: undefined,
    };
    this.show = this.show.bind(this);
  }

  show(direction) {
    this.setState({ username: this.props.currentUser && this.props.currentUser.username || "" })
    this.refs.usernameModal.show(direction)
  }

  save(valid) {
    if (!valid) return this.refs.usernameModal.shake();
    this.setState({ error: null, saving: true })
    ddp.call("users/username/set", [this.state.username]).catch(err => {
      this.setState({ error: "Invalid", saving: false })
    }).then(res => {
      this.setState({ error: null, saving: false, saved: true })
      segment.track('Changed Username');
      this.refs.usernameModal.hide()
    })
  }

  onChangeText(text) {
    this.setState({ username: text, available: undefined, error: null, saved: false })
    ddp.call("users/username/available", [text]).then((res) => {
      this.setState({ available: res })
    })
  }

  ctaText() {
    const { currentUser } = this.props;
    const { username, available, error, saving, saved } = this.state;
    if (saved || (currentUser && currentUser.username === username)) return 'Saved';
    if (saving) return 'Saving...';
    if (error) return error;
    if (username.length < 1) return 'Too short';
    if (username.length > 30) return 'Too long';
    if (/ /.test(username)) return 'No spaces';
    if (!/^[a-z0-9A-Z_-]{1,30}$/.test(username)) return 'No special chars';
    if (available === undefined) return 'Checking...';
    if (available === false) return 'Taken';
    if (available === true) return 'Save';
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.currentUser || !nextProps.currentUser || this.props.currentUser.username !== nextProps.currentUser.username) this.setState({ username: nextProps.currentUser && nextProps.currentUser.username || "" })
  }

  render() {
    const { loggedIn, currentUser } = this.props;
    const { username } = this.state;
    const valid = this.ctaText() === 'Save';

    const step = currentUser && currentUser.username ? null : 'Last Step';
    const title = currentUser && currentUser.username ? 'Change Username' : 'Pick a Username';
    const subTitle = currentUser && currentUser.username ?
      'It\'s your only public detail' : 'It\'s your only public detail\nYou can change it later';

    return (
      <PosytModal ref="usernameModal" style={styles.modal}
        alwaysVisible={loggedIn && currentUser && !currentUser.username}
        onShow={() => this.refs.username.focus()}
      >
        <View style={[styles.modalButton, { height: (step ? 90 : 60), paddingHorizontal: 5 }]}>
          { !!step && <Text style={[styles.modalSubText, { fontWeight: '300' }]}>{step}</Text> }
          <Text style={[styles.modalSubText, { fontWeight: '600' }]}>{title}</Text>
          <Text style={[styles.modalSubText, { fontWeight: '400' }]}>{subTitle}</Text>
        </View>
        <View style={styles.modalSeparator} />
        <TextInput
          ref='username'
          style={styles.modalTextInput}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={false}
          maxLength={30}
          placeholder="username"
          value={username}
          onChangeText={(text) => this.onChangeText(text)}
          clearButtonMode="never"
          onSubmitEditing={() => this.save(valid)}
          />
        <View style={styles.modalSeparator}/>
        <TouchableHighlight style={[styles.modalButton, { backgroundColor: appleGrey }, valid && { backgroundColor: red }]} underlayColor={lightRed} onPress={() => this.save(valid)}>
          <Text style={[styles.modalText, { color: 'white' }]}>{this.ctaText()}</Text>
        </TouchableHighlight>
      </PosytModal>
    )
  }
}

function mapStateToProps(state) {
  return {
    loggedIn: state.auth.loggedIn,
    currentUser: state.auth.currentUser,
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })(UsernameModal)
