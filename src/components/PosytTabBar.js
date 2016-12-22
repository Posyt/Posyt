import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  Animated,
  PushNotificationIOS,
} from 'react-native';
import { connect } from 'react-redux';
import pluralize from 'pluralize';
import { DigitsManager } from 'react-native-fabric-digits';
import FBSDK from 'react-native-fbsdk';
import _ from 'lodash';
import segment from '../lib/segment';
import {
  red,
  blue,
  lightGrey,
  black,
} from '../lib/constants';
import openURL from '../lib/openURL';
import loginWithFacebook from '../lib/loginWithFacebook';
import { ddp } from '../lib/DDP';
import PosytModal from './PosytModal';
import UsernameModal from './UsernameModal';
import FeedsModal from './FeedsModal';
import PointsModal from './PointsModal';
import InviteModal from './InviteModal';
import { promptForFeedback } from '../lib/feedback';

class PosytTabBar extends React.Component {
  constructor(props) {
    super(props);
    this.selectedTabIcons = [];
    this.unselectedTabIcons = [];
    this.state = {
      hideAnim: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this.setAnimationValue({ value: this.props.activeTab });
    this._listener = this.props.scrollValue.addListener((data) => this.setAnimationValue(data));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      if (nextProps.visible) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  setAnimationValue({ value }) {
    this.unselectedTabIcons.forEach((icon, i) => {
      const iconRef = icon;
      if (value - i >= 0 && value - i <= 1) {
        iconRef.setNativeProps({ style: { opacity: value - i } });
      }
      if (i - value >= 0 && i - value <= 1) {
        iconRef.setNativeProps({ style: { opacity: i - value } });
      }
    });
  }

  hide() {
    Animated.timing(
      this.state.hideAnim,
      { toValue: 100, duration: 200 },
    ).start();
  }

  show() {
    Animated.timing(
      this.state.hideAnim,
      { toValue: 0, duration: 200 },
    ).start();
  }

  loginWithFacebook = () => {
    loginWithFacebook();
  }

  showDigits = () => {
    const digitsOptions = { appearance: { accentColor: { hex: red, alpha: 1 } } };
    this.refs.loginModal.hide('top', () => {
      this.setState({ showAnotherModal: true }, () => {
        setTimeout(() => {
          DigitsManager.launchAuthentication(digitsOptions)
            .then(this.handleDigitsLogin)
            .catch(this.handleDigitsError);
        }, 300);
      });
    });
  }

  handleDigitsError = (err) => {
    this.setState({ showAnotherModal: false });
    if (global.__DEV__) console.warn('Digits login failed', err);
  }

  handleDigitsLogin = (credentials) => {
    this.setState({ showAnotherModal: false });
    const digits = { ...credentials };
    delete digits.consumerKey;
    delete digits.consumerSecret;
    if (global.__DEV__) console.log('Digits login successful', digits);
    ddp.login({ digits })
  }

  logout() {
    FBSDK.LoginManager.logOut();
    DigitsManager.logout();
    ddp.logout();
  }

  renderPosytModal() {
    const { loggedIn, loggingIn, currentUser } = this.props;
    const { showAnotherModal } = this.state;
    let posytModal;

    const numPosyts = currentUser && currentUser.meta && currentUser.meta.numPosyts || 0;
    const numConversations = currentUser && currentUser.meta && currentUser.meta.numConversations || 0;
    const numMessages = currentUser && currentUser.meta && currentUser.meta.numMessages || 0;

    if (loggedIn) {
      posytModal = (
        <PosytModal key="posytModal" ref="posytModal" style={styles.modal}>
          <TouchableHighlight style={styles.modalButton} underlayColor={'#f5f5f5'} onPress={() => {
              this.refs.posytModal.hide("left", () => this.refs.feedsModal.getWrappedInstance().show("right"));
              segment.screen('Viewed Feeds Modal');
          }}>
            <Text style={styles.modalText}>Feeds</Text>
          </TouchableHighlight>
          <View style={styles.modalSeparator} />
          <View style={styles.modalCol}>
            <Text style={[styles.modalSubText, { marginTop: 10, marginBottom: -10, fontWeight: '400' }]}>Feedback</Text>
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => { this.refs.posytModal.hide("top", () => promptForFeedback()) }}>
                <Image source={require('../../assets/images/apple.png')} style={[styles.modalIcon]}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => { this.refs.posytModal.hide("left", () => openURL("https://twitter.com/posytapp")) }}>
                <Image source={require('../../assets/images/twitter.png')} style={[styles.modalIcon]}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => { this.refs.posytModal.hide("left", () => openURL("https://www.facebook.com/posytapp/")) }}>
                <Image source={require('../../assets/images/facebook.png')} style={[styles.modalIcon]}/>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.modalSeparator} />
          <TouchableHighlight style={styles.modalButton} underlayColor={'#f5f5f5'} onPress={() => {
              this.refs.posytModal.hide("left", () => this.refs.pointsModal.getWrappedInstance().show("right"));
              segment.screen('Viewed Points Modal');
          }}>
            <Text style={styles.modalText}>{currentUser && currentUser.meta && currentUser.meta.points || 0}</Text>
          </TouchableHighlight>
          <View style={styles.modalSeparator}/>
          <View style={[{ flexDirection: 'row' }]}>
            <TouchableHighlight style={[styles.modalButton, { height: 38, flex: 3 }]} underlayColor={'#f5f5f5'} onPress={() => {
                this.refs.posytModal.hide("left", () => this.refs.usernameModal.getWrappedInstance().show("right"));
                segment.screen('Viewed Username Modal');
            }}>
              <Text style={styles.modalSubText}>{currentUser && currentUser.username}</Text>
            </TouchableHighlight>
            <View style={[styles.modalSeparator, { height: 38, width: 1 }]}/>
            <TouchableHighlight style={[styles.modalButton, { height: 38, flex: 1 }]} underlayColor={'#f5f5f5'} onPress={() => {
                this.refs.posytModal.hide("left", () => this.refs.logoutModal.show("right"))
              }}>
              <Image source={require('../../assets/images/logout.png')} style={[styles.modalIcon, { width: 16, height: 16 }]} />
            </TouchableHighlight>
          </View>
          <View style={styles.modalSeparator}/>
          <View style={[styles.modalRow, { marginHorizontal: 0 }]}>
            <View style={[styles.modalCol, { marginTop: 0, flex: 1 }]}>
              <Text style={[styles.modalSubText]}>{numPosyts}</Text>
              <Text style={styles.modalLightSubText}>{pluralize('Posyt', numPosyts)}</Text>
            </View>
            <View style={[styles.modalSeparator, { height: 38, width: 1 }]}/>
            <View style={[styles.modalCol, { marginTop: 0, flex: 1 }]}>
              <Text style={[styles.modalSubText]}>{numConversations}</Text>
              <Text style={styles.modalLightSubText}>{pluralize('Match', numConversations)}</Text>
            </View>
            <View style={[styles.modalSeparator, { height: 38, width: 1 }]}/>
            <View style={[styles.modalCol, { marginTop: 0, flex: 1 }]}>
              <Text style={[styles.modalSubText]}>{numMessages}</Text>
              <Text style={styles.modalLightSubText}>{pluralize('Message', numMessages)}</Text>
            </View>
          </View>
        </PosytModal>
      );
    } else {
      posytModal = (
        <PosytModal key="posytModal" ref="posytModal" style={styles.modal}>
          <TouchableHighlight style={styles.modalButton} underlayColor={'#f5f5f5'} onPress={() => { this.refs.posytModal.hide("left", () => this.refs.loginModal.show("right")) }}>
            <Text style={styles.modalText}>Login</Text>
          </TouchableHighlight>
        </PosytModal>
      );
    }

    return [
      posytModal
      ,
      <PosytModal key="loginModal" ref="loginModal" style={styles.modal} alwaysVisible={!loggedIn && !showAnotherModal} onShow={() => segment.screen('Viewed Login Modal')}>
        {(loggingIn || loggedIn) ?
          <TouchableHighlight style={[styles.modalButton, { height: 38 }]} underlayColor={'white'}>
            <Text style={[styles.modalSubText, { fontWeight: "700" }]}>Logging in...</Text>
          </TouchableHighlight>
        :
          <View>
            <TouchableHighlight style={[styles.modalButton, { height: 38, backgroundColor: blue }]} underlayColor={'white'}>
              <Text style={[styles.modalSubText, { fontWeight: "700", color: 'white' }]}>Login with</Text>
            </TouchableHighlight>
            <View style={styles.modalSeparator} />
            <TouchableHighlight style={[styles.modalButton]} underlayColor={'#f5f5f5'} onPress={ () => { this.refs.loginModal.hide("top", this.loginWithFacebook) }}>
              <Text style={[styles.modalText]}>Facebook</Text>
            </TouchableHighlight>
            <View style={styles.modalSeparator} />
            <TouchableHighlight style={[styles.modalButton]} underlayColor={'#f5f5f5'} onPress={this.showDigits}>
              <Text style={[styles.modalText]}>Phone Number</Text>
            </TouchableHighlight>
          </View>
        }
      </PosytModal>
      ,
      <PosytModal key="logoutModal" ref="logoutModal" style={styles.modal}>
        <TouchableHighlight style={[styles.modalButton, { height: 38 }]} underlayColor={'white'}>
          <Text style={[styles.modalSubText, { fontWeight: "700" }]}>Log out?</Text>
        </TouchableHighlight>
        <View style={styles.modalSeparator}/>
        <TouchableHighlight style={[styles.modalButton]} underlayColor={'#f5f5f5'} onPress={ () => { this.refs.logoutModal.hide("bottom", () => this.logout()) }}>
          <Text style={[styles.modalText]}>OK</Text>
        </TouchableHighlight>
      </PosytModal>
      ,
      <UsernameModal key="usernameModal" ref="usernameModal" />
      ,
      <FeedsModal key="feedsModal" ref="feedsModal" />
      ,
      <InviteModal key="inviteModal" ref="inviteModal" />
      ,
      <PointsModal key="pointsModal" ref="pointsModal" showInviteModal={(dir) => this.refs.inviteModal.getWrappedInstance().show(dir)} />
    ]
  }

  render() {
    const { hideAnim } = this.state;
    const { currentUser } = this.props;
    const numUnreadConversations = currentUser && currentUser.meta && currentUser.meta.numUnreadConversations;

    if (_.isInteger(numUnreadConversations)) PushNotificationIOS.setApplicationIconBadgeNumber(numUnreadConversations);

    const tabsAnimStyle = {
      top: hideAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -65],
      }),
    };

    return (
      <Animated.View style={[styles.tabs, tabsAnimStyle]}>
        <TouchableOpacity key='documents' onPress={() => this.props.goToPage(0)} style={styles.tab}>
          <Image source={require('../../assets/images/documents.png')} style={[styles.iconLeft, {tintColor: red}]}
            ref={(icon) => { this.selectedTabIcons[0] = icon }}/>
          <Image source={require('../../assets/images/documents.png')} style={[styles.iconLeft, {tintColor: '#ccc'}]}
            ref={(icon) => { this.unselectedTabIcons[0] = icon }}/>
        </TouchableOpacity>
        <TouchableOpacity key='pulb' onPress={() => {
            this.refs.posytModal.show();
            segment.screen('Viewed Posyt Modal');
          }}
          style={[styles.tab]}
        >
          <Image source={require('../../assets/images/pulb.png')} style={[styles.iconCenter, {tintColor: "#ccc"}]} />
          {this.renderPosytModal()}
        </TouchableOpacity>
        <TouchableOpacity key='chat' onPress={() => this.props.goToPage(1)} style={[styles.tab]}>
          <Image source={require('../../assets/images/chat.png')} style={[styles.iconRight, {tintColor: red}]}
            ref={(icon) => { this.selectedTabIcons[1] = icon }}/>
          <Image source={require('../../assets/images/chat.png')} style={[styles.iconRight, {tintColor: '#ccc'}]}
            ref={(icon) => { this.unselectedTabIcons[1] = icon }}/>
          {!!numUnreadConversations &&
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{numUnreadConversations}</Text>
            </View>
          }
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

PosytTabBar.propTypes = {
  goToPage: React.PropTypes.func,
  activeTab: React.PropTypes.number,
  tabs: React.PropTypes.array,
  visible: React.PropTypes.bool,
};

const styles = StyleSheet.create({
  tabs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 25,
    height: 65,
    flexDirection: 'row',
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    position: 'relative',
  },
  iconLeft: {
    width: 30,
    height: 30,
    position: 'absolute',
    top: 0,
    left: 20,
    backgroundColor: lightGrey,
  },
  iconRight: {
    width: 30,
    height: 30,
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: lightGrey,
  },
  unreadBadge: {
    backgroundColor: red,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    top: -6,
    right: 45,
    position: 'absolute',
  },
  unreadText: {
    marginHorizontal: 7,
    color: 'white',
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: '200',
    // fontFamily: 'Rooney Sans',
  },

  iconCenter: {
    width: 30,
    height: 30,
    marginTop: 2,
  },

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
  modalLightSubText: {
    flex: 0,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Rooney Sans',
    marginTop: 1,
  },
  modalRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
  },
  modalCol: {
    flexDirection: 'column',
    flex: 0,
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
});

function mapStateToProps(state) {
  return {
    visible: state.tabBar.visible,
    loggedIn: state.auth.loggedIn,
    loggingIn: state.auth.loggingIn,
    currentUser: state.auth.currentUser,
  };
}

export default connect(mapStateToProps)(PosytTabBar);
