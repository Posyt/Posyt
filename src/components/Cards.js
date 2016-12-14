import React from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  TouchableHighlight,
  Image,
  Text,
  ActionSheetIOS,
  PushNotificationIOS,
  AsyncStorage,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import {
  popTopCard,
  unpopLastCard,
} from '../lib/actions';
import {
  red,
  green,
  black,
  posytUri,
} from '../lib/constants.js';
import {
  articleTitle,
  articleDescription,
} from '../lib/articleHelpers';
import PosytModal from './PosytModal';
import Card from './Card';
import { ddp } from '../lib/DDP';
import { deepLinker } from '../lib/DeepLinker';
import segment from '../lib/segment';
import _ from 'lodash';

const { width } = Dimensions.get('window');
const THRESHOLD = width / 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 7,
  },
  cardWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },

  modal: {
    // flex: 1,
    // alignSelf: 'center',
    width: 200,
  },
  modalButton: {
    flex: 1,
    height: 100,
    // padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
    // marginHorizontal: 16,
  },
  modalCol: {
    flexDirection: 'column',
    flex: 1,
  },
  modalIcon: {
    width: 34,
    height: 34,
    marginVertical: 2,
    tintColor: black,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#eee',
  },
});

class Cards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pan: new Animated.ValueXY(),
      panPush: new Animated.ValueXY(),
    };
  }

  // TODO: FIX: this component seems to get mounted, unmounted and mounted again
  //   on app initialization. Make sure it's only mounted once
  componentWillMount() {
    ddp.subscribe('Cards').then((id) => { this.subId = id; });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loggedIn !== nextProps.loggedIn) {
      ddp.unsubscribe(this.subId, { keepData: true });
      ddp.subscribe('Cards').then((id) => { this.subId = id; });
    }
  }

  componentWillUnmount() {
    ddp.unsubscribe(this.subId);
  }

  onRelease(e, g) {
    const popped = (Math.abs(g.dx) > THRESHOLD || Math.abs(g.dy) > THRESHOLD);
    if (popped) {
      this.animateOff(e, g);
      return false;
    }
    this.animateBack();
    return true;
  }

  animateBack() {
    Animated.spring(
      this.state.pan,
      { toValue: { x: 0, y: 0 } },
    ).start(); // reset the pan to 0,0
  }

  animateOff(e, g) {
    const vx = g.vx + (0.2 * Math.sign(g.vx));
    const vy = g.vy + (0.2 * Math.sign(g.vy));
    const oldG = { ...g };
    const oldProps = { ...this.props };
    const time = (new Date).getTime();
    Animated.timing(
      this.state.panPush,
      {
        toValue: { x: 500 * vx, y: 500 * vy },
        duration: 200,
      }
    ).start(() => {
      if (oldG.dx > THRESHOLD) {
        this.firstTimeAlert('like', 'Like 👍', 'Cool! You\'ll get matches with people who like what you like. Matches are anonymous. They\'ll only see your username and the likes you have in common.')
        .then(proceed => {
          if (proceed) this.swipe(oldProps, time, 'like');
        });
      } else if (oldG.dx < -THRESHOLD) {
        this.firstTimeAlert('skip', 'Skip 😐', 'Skip the things you\'re not interested in.')
        .then(proceed => {
          if (proceed) this.swipe(oldProps, time, 'skip');
        });
      } else if (oldG.dy > THRESHOLD) {
        this.firstTimeAlert('report', 'Report 👮', 'See something inappropriate or offensive? Help us keep Posyt high-quality. Let\'s check out the reporting options.')
        .then(proceed => {
          if (proceed) this.flag(oldProps, time);
        });
      } else if (oldG.dy < -THRESHOLD) {
        this.firstTimeAlert('share', 'Share 📢', 'Help the best ideas get noticed. Let\'s go!')
        .then(proceed => {
          if (proceed) this.share(oldProps, time);
        });
      }
      this.refs.card0.getWrappedInstance().resetPan(false);
      this.props.dispatch(popTopCard());
      this.state.pan.setValue({ x: 0, y: 0 });
      this.state.panPush.setValue({ x: 0, y: 0 });
    });
  }

  calculateExpandedTime(props) {
    const { expandedAts, contractedAts } = props;
    let expandedTime = 0;
    try {
      expandedTime = contractedAts.reduce((prev, cur, i) => {
        return prev + cur.getTime() - expandedAts[i].getTime();
      }, expandedTime);
    } catch (err) {
      if (global.__DEV__) console.log(err);
    }
    return expandedTime;
  }

  share(props, time) {
    const { cards, currentUser } = props;
    const card = cards[0];
    const canonicalIdentifier = `${card._type.slice(0, 1)}/${card._id}`;
    const canonicalUrl = `${posytUri}/${canonicalIdentifier}`;
    const universalObjectOptions = {
      metadata: {
        _type: card._type,
        _id: card._id,
        username: currentUser.username,
      },
      canonicalUrl,
    };
    const controlParams = {
      $desktop_url: canonicalUrl,
    };
    const shareOptions = {};
    if (card._type === 'article') {
      // shareOptions.text = 'Take a look at this article I just swiped across';
      shareOptions.messageHeader = 'Take a look at this article I just swiped across';
      // shareOptions.messageBody = 'TODO:';
      universalObjectOptions.contentTitle = articleTitle(card);
      universalObjectOptions.contentDescription = articleDescription(card);
      universalObjectOptions.contentImageUrl = card.image_url;
    } else if (card.type === 'posyt') {
      // shareOptions.text = 'Take a look at this posyt I just swiped across';
      shareOptions.messageHeader = 'Take a look at this posyt I just swiped across';
      // shareOptions.messageBody = 'TODO:';
      universalObjectOptions.contentDescription = card.content;
    }
    const linkProperties = { feature: 'share', channel: 'RNApp' };
    deepLinker.branch
    .createBranchUniversalObject(canonicalIdentifier, universalObjectOptions)
    .showShareSheet(shareOptions, linkProperties, controlParams)
    .then(({ channel, completed, error }) => {
      if (global.__DEV__) console.log('shared:', channel, completed, error);
      if (completed) {
        this.currentProps = props;
        this.currentTime = time;
        // this.refs.afterShareModal.show('top');
        this.modalSwipe('like');
      } else {
        this.props.dispatch(unpopLastCard());
      }
      segment.track('Card Share', { channel, completed, error, _type: card._type, _id: card._id, canonicalUrl });
    })
    .catch((e) => {
      this.props.dispatch(unpopLastCard());
    });
  }

  modalSwipe(action) {
    // this.refs.afterShareModal.hide({ like: 'right', skip: 'left' }[action]);
    this.swipe(this.currentProps, this.currentTime, action);
  }

  flag(props, time) {
    const buttons = ['NSFW', 'Spam', 'Cruel', 'Cancel'];
    ActionSheetIOS.showActionSheetWithOptions({
      title: 'Report',
      options: buttons,
      cancelButtonIndex: 3,
    },
    (buttonIndex) => {
      const reason = buttons[buttonIndex].toLowerCase();
      if (reason === 'cancel') {
        this.props.dispatch(unpopLastCard());
      } else {
        this.swipe(props, time, 'flag', reason);
      }
      segment.track('Card Flag', { reason });
    });
  }

  swipe(props, time, action, reason) {
    this.currentProps = null;
    this.currentTime = null;
    // TODO: show posyt modals explaining each direction the first time you swipe it
    if (action === 'like') this.requestPushNotificationPermissions();
    const { cards, startedReadingAt } = props;
    const card = cards[0];
    const attrs = {
      _id: card._id,
      type: card._type,
      action,
      readTime: time - startedReadingAt.getTime() || 0,
      expandedTime: this.calculateExpandedTime(props),
    };
    if (action === 'flag') attrs.reason = reason;
    segment.track('Card Swipe', { _type: card._type, _id: card._id, action, readTime: attrs.readTime, expandedTime: attrs.expandedTime, reason });
    ddp.call('users/swipe', [attrs]).catch(err => {
      if (global.__DEV__) console.log('Swipe Error:', err);
      // TODO: show a subtle toast over the activity bar
    });
  }

  async firstTimeAlert(action, title, body) {
    const id = `seen/firstTimeAlert/${action}`;
    const permission = await AsyncStorage.getItem(id);
    return new Promise((resolve) => {
      if (permission === null) {
        segment.track(`Card Swipe - First Time Alert 1 - ${action} - Requested`);
        Alert.alert(
          title,
          body,
          [
            { text: 'Cancel', onPress: () => {
              segment.track(`Card Swipe - First Time Alert 2 - ${action} - Denied`);
              this.props.dispatch(unpopLastCard());
              resolve(false);
            } },
            { text: _.capitalize(action), onPress: () => {
              AsyncStorage.setItem(id, 'true|'+(new Date).toString());
              segment.track(`Card Swipe - First Time Alert 2 - ${action} - Granted`);
              resolve(true);
            } },
          ],
        );
      } else {
        resolve(true);
      }
    });
  }

  async requestPushNotificationPermissions() {
    const permission = await AsyncStorage.getItem('push/permission');
    if (permission === null) {
      segment.track('Card Swipe - Push Permission 1 - Requested');
      Alert.alert(
        'Notify me when I match with someone',
        'Notifications are sent when you get a new match and when someone messages you. You\'ll match with someone when you like a lot of the same cards.',
        [
          { text: 'Not now', onPress: () => {
            AsyncStorage.setItem('push/permission', 'false|'+(new Date).toString());
            segment.track('Card Swipe - Push Permission 2 - Denied');
          } },
          { text: 'OK', onPress: () => {
            AsyncStorage.setItem('push/permission', 'true|'+(new Date).toString());
            segment.track('Card Swipe - Push Permission 2 - Granted');
            PushNotificationIOS.requestPermissions();
          } },
        ],
      );
    }
  }

  render() {
    const { pan, panPush } = this.state;
    const { cards } = this.props;
    const cardComponents = [];
    const firstFour = cards.slice(0, 4);
    const dx = pan.x.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [1, 0, 1],
    });
    const dy = pan.y.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [1, 0, 1],
    });
    const d = Animated.add(dx, dy).interpolate({
      inputRange: [0, THRESHOLD],
      outputRange: [0.0, 1.0],
      extrapolate: 'clamp',
    });

    firstFour.forEach((data, i) => {
      const y = Animated.add(new Animated.Value(i), Animated.multiply(new Animated.Value(-1.0), d)).interpolate({
        inputRange: [0, 2, 2.7, 3],
        outputRange: [0, 13 * 2, 13.0 * 2.3, 13 * 2],
        extrapolate: 'clamp',
      });
      const scale = Animated.add(new Animated.Value(1.0 -(0.03 * i)), Animated.multiply(d, new Animated.Value(0.03))).interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });
      const cardWrapAnim = {
        transform: [
          { translateY: y },
          { scaleX: scale },
          { scaleY: scale },
        ],
      };
      const topCardWrapAnim = {
        transform: [
          { translateX: panPush.x },
          { translateY: panPush.y },
        ],
      };
      const card = (
        <Animated.View key={data._id} style={[styles.cardWrap, cardWrapAnim, i === 0 && topCardWrapAnim]}>
          <Card
            ref={'card'+i}
            threshold={THRESHOLD}
            onMove={Animated.event([null, { dx: pan.x, dy: pan.y }])}
            onRelease={(e, g) => this.onRelease(e, g)}
            data={data}
          />
        </Animated.View>
      );
      cardComponents.unshift(card);
    });

    return (
      <View style={styles.container} {...this.props}>
        {cardComponents}
        {/* <PosytModal key="afterShareModal" ref="afterShareModal" style={styles.modal} onDismiss={() => this.props.dispatch(unpopLastCard())}>
          <View>
            <View style={[styles.modalButton, { height: 60, marginHorizontal: 10 }]}>
              <Text style={[styles.modalSubText, { fontWeight: "700" }]}>Thanks for sharing 😁</Text>
              <Text style={[styles.modalSubText, { fontWeight: "400" }]}>Did you want to 😐 or 👍?</Text>
            </View>
            <View style={styles.modalSeparator}/>
            <View style={styles.modalRow}>
              <TouchableHighlight style={[styles.modalButton]} underlayColor={'#f5f5f5'} onPress={() => { this.modalSwipe('skip') }}>
                <Text style={styles.modalIcon}>
                  😐
                </Text>
              </TouchableHighlight>
              <View style={[styles.modalSeparator, { height: 100, width: 1 }]}/>
              <TouchableHighlight style={[styles.modalButton]} underlayColor={'#f5f5f5'} onPress={() => { this.modalSwipe('like') }}>
                <Text style={styles.modalIcon}>
                  👍
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </PosytModal> */}
      </View>
    );
  }
}

Cards.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  loggedIn: React.PropTypes.bool.isRequired,
  cards: React.PropTypes.array.isRequired,
  currentUser: React.PropTypes.object,
  startedReadingAt: React.PropTypes.instanceOf(Date).isRequired,
  expandedAts: React.PropTypes.array.isRequired,
  contractedAts: React.PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    loggedIn: state.auth.loggedIn,
    currentUser: state.auth.currentUser,
    cards: state.cards.cards,
    startedReadingAt: state.cards.startedReadingAt,
    expandedAts: state.cards.expandedAts,
    contractedAts: state.cards.contractedAts,
  };
}

export default connect(mapStateToProps)(Cards)
