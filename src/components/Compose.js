import React from 'react';
import {StyleSheet, View, Text, Image, TextInput, TouchableOpacity, Animated, Dimensions, PanResponder, PixelRatio, AsyncStorage, Alert, Easing} from 'react-native';
import {
  red,
  lightGrey,
} from '../lib/constants.js';
import {
  setTabBarLocked,
  removeTabBarTopMargin,
} from '../lib/actions.js';
import { connect } from 'react-redux';
import { ddp } from '../lib/DDP';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import PosytModal from './PosytModal';
import _ from 'lodash';
import TimerMixin from 'react-timer-mixin';
import reactMixin from 'react-mixin';
import segment from '../lib/segment';
const { height, width } = Dimensions.get('window');

const STARTING_VISIBLE_HEIGHT = 70;
const STARTING_HEIGHT = STARTING_VISIBLE_HEIGHT + 150;
const MAX_CHARS = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  underlay: {
    position: 'absolute',
    bottom: -height,
    left: 0,
    width,
    height,
    backgroundColor: lightGrey,
  },
  wrap: {
    position: 'absolute',
    height: STARTING_HEIGHT,
    left: 0,
    right: 0,
    bottom: STARTING_VISIBLE_HEIGHT - STARTING_HEIGHT,
    borderRadius: 4,
    marginHorizontal: 10,
    // shadowColor: 'black',
    // shadowOffset: { width: 0, height: 1 / PixelRatio.get() },
    // shadowOpacity: 0.15,
    // shadowRadius: 1,
  },
  inner: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1 / PixelRatio.get(),
    borderColor: '#ddd',
    paddingTop: 2,
    paddingBottom: STARTING_HEIGHT - STARTING_VISIBLE_HEIGHT,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    paddingBottom: 20,
    fontSize: 18,
    fontFamily: 'Rooney Sans',
  },
  posytButtonWrap: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    justifyContent: 'center',
  },
  posytButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 4,
    paddingTop: 7,
    paddingBottom: 2,
    paddingHorizontal: 8,
  },
  posytButtonText: {
    fontSize: 18,
    // fontWeight: 'bold',
    color: '#ddd',
    fontFamily: 'Rooney Sans',
  },
  closeButtonWrap: {
    position: 'absolute',
    left: 8,
    bottom: -100,
    justifyContent: 'center',
  },
  closeButton: {
    // borderWidth: 1,
    // borderColor: '#eee',
    // borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  closeButtonImage: {
    tintColor: '#ddd',
    width: 20,
    height: 20,
  },
  charCount: {
    fontSize: 14,
    fontFamily: 'Rooney Sans',
    color: '#ddd',
    top: -7,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  modalSeparator: {
    height: 1,
    backgroundColor: '#eee',
  },
});

class Compose extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      yAnim: new Animated.Value(STARTING_VISIBLE_HEIGHT - STARTING_HEIGHT),
      heightAnim: new Animated.Value(STARTING_HEIGHT),
      nAnim: new Animated.Value(0),
      pan: new Animated.ValueXY(),
      savingAnim: new Animated.Value(1),
      placeholder: 'Write something...',
      newPosytText: '',
      charCount: MAX_CHARS,
    };
    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Don't allow swiping the between tabs while moving this
        // this.props.dispatch(setTabBarLocked(true));
        this.longTimer = setTimeout(() => {
          this.longPress = true;
        }, 150);
      },
      onPanResponderMove: Animated.event([null, {
        //  dx: this.state.pan.x,
        dy: this.state.pan.y,
      }]),
      onPanResponderRelease: (e, g) => this._onPanResponderEnd(e,g),
      onPanResponderTerminationRequest: (e, g) => (g.dx < -100 || g.dx > 100), // NOTE: this throws a scroll view doesn't take rejection well
      onPanResponderTerminate: (e, g) => this._onPanResponderEnd(e,g),
    });
  }

  _onPanResponderEnd(e, g) {
    clearTimeout(this.longTimer); // end the press timer
    // this.props.dispatch(setTabBarLocked(false)) // re-enable tab bar swiping
    Animated.sequence([
      Animated.decay(this.state.pan, { // coast to a stop
        velocity: { x: g.vx, y: g.vy }, // velocity from gesture release
        deceleration: 0.985,
      }),
      Animated.spring(
        this.state.pan,
        { toValue: { x: 0, y: 0 } },
      ),
    ]).start(); // reset the pan to 0,0
    if (g.dx < 100 && g.dx > -100 && g.vx < 0.3 && g.vx > -0.3) {
      if (this.longPress) {
        // TODO: smooth this animation out. try to apply the current dy and vy to the open animation
        if (g.dy < -20) this.focusInput(); // focus if dragging up
      } else {
        this.focusInput(); // focus if short tap
      }
    }
    this.longPress = false; // reset longPress
  }

  focusInput() {
    this.inputIsFocused = true;
    this.refs.input.focus();
  }

  componentWillMount() {
    this._subscriptions = [];
    this._subscriptions.push(RCTDeviceEventEmitter.addListener('keyboardWillShow', (frames) => this.updateKeyboardSpace(frames)));
    // this._subscriptions.push(RCTDeviceEventEmitter.addListener('keyboardDidShow', (frames) => this.updateKeyboardSpace(frames)));
    // this._subscriptions.push(RCTDeviceEventEmitter.addListener('keyboardWillHide', (frames) => this.resetKeyboardSpace(frames)));
  }

  componentWillUnmount() {
    this._subscriptions.forEach(
      (subscription) => subscription.remove()
    );
    this._subscriptions = null;
  }

  updateKeyboardSpace(frames) {
    if (frames.endCoordinates && frames.endCoordinates.screenY && this.inputIsFocused) {
      this.open = true;
      const placeholders = [
        'Write something... (It\'s all anonymous)',
        'e.g. Share an idea...',
        'e.g. Share what you\'re working on...',
        'e.g. Ask for help with something...',
        'e.g. Share what you want to learn...',
        'e.g. Share something you just learned...',
        'e.g. Send a wish into the world...',
        'e.g. Tell the void what you want to talk about...',
        'e.g. Share an interesting link...',
      ];
      const placeholder = _.sample(placeholders);
      this.setState({ placeholder });
      this.props.dispatch(setTabBarLocked(true));
      // NOTE: GBoard the google keyboard calls keyboardWillShow multiple times
      //   with incrementally more accurate coordinates
      //   requestAnimationFrame only animates to the first set of coords
      //   but not subsequent more accurate coords
      // this.requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(
          this.state.yAnim
          , { toValue: frames.endCoordinates.height + 10 }
        ),
        Animated.spring(
          this.state.heightAnim
          , { toValue: frames.endCoordinates.screenY - 30 }
        ),
        Animated.spring(
          this.state.nAnim
          , { toValue: 100 }
        ),
      ]).start(() => {
        if (this.open) this.props.dispatch(removeTabBarTopMargin(true));
      });
      // });
      segment.screen('Viewed Compose');
    }
  }

  // resetKeyboardSpace(frames) {
  //   // if (frames.endCoordinates && frames.endCoordinates.screenY) {
  //   //   this.close()
  //   // }
  // }

  playSavingAnimation() {
    Animated.sequence([
      Animated.timing(
        this.state.savingAnim,
        {
          toValue: 1.1,
          duration: 200,
          easing: Easing.linear,
        }
      ),
      Animated.timing(
        this.state.savingAnim,
        {
          toValue: 0.9,
          duration: 400,
          easing: Easing.linear,
        }
      ),
      Animated.timing(
        this.state.savingAnim,
        {
          toValue: 1.0,
          duration: 200,
          easing: Easing.linear,
        }
      ),
    ]).start(() => {
      if (this.state.saving) this.playSavingAnimation();
    });
  }

  close(direction = 'down') {
    this.open = false;
    this.refs.input.blur();
    this.props.dispatch(setTabBarLocked(false));
    this.props.dispatch(removeTabBarTopMargin(false));
    this.requestAnimationFrame(() => {
      if (direction === 'up') {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(
              this.state.yAnim
              , { toValue: this.state.yAnim._value - 50, duration: 200 }
            ),
            Animated.timing(
              this.state.yAnim
              , { toValue: height, duration: 200 }
            ),
          ]),
        ]).start(() => {
          this.setState({ placeholder: 'Thanks for sharing 😊' });
          setTimeout(() => this.setState({ placeholder: 'Write something...' }), 2000);
          this.state.yAnim.setValue(-300);
          this.reset();
        });
      } else {
        if (this.state.newPosytText && this.state.newPosytText.length) {
          Alert.alert(
            'Closing',
            'Your changes will be lost.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Discard', onPress: () => this.closeDown() },
            ]
          );
        } else {
          this.closeDown();
        }
      }
    });
  }

  closeDown() {
    this.reset();
    this.requestAnimationFrame(() => {
      this.setState({ placeholder: 'Write something...' });
    });
  }

  reset() {
    Animated.parallel([
      Animated.spring(
        this.state.yAnim
        , { toValue: STARTING_VISIBLE_HEIGHT - STARTING_HEIGHT }
      ),
      Animated.spring(
        this.state.heightAnim
        , { toValue: STARTING_HEIGHT }
      ),
      Animated.spring(
        this.state.nAnim
        , { toValue: 0 }
      ),
    ]).start();
    this.requestAnimationFrame(() => {
      this.setState({ newPosytText: '', charCount: MAX_CHARS, saving: false });
    });
  }

  getCurrentPosition() {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    });
  }

  _onChangeText(text) {
    this.setState({ newPosytText: text, charCount: MAX_CHARS - text.length });
  }

  requestGeolocationPermission() {
    return new Promise((resolve) => {
      segment.track('Posyt Create - Geo Permission 1 - Requested');
      Alert.alert(
        'Meet people nearby?',
        'Your location is never shared. It is only used to prioritize matching you with people nearby.',
        [
          { text: 'Not now', onPress: () => {
            AsyncStorage.setItem('geolocation/permission', 'false|'+(new Date).toString());
            segment.track('Posyt Create - Geo Permission 2 - Denied');
            resolve(false);
          } },
          { text: 'OK', onPress: () => {
            AsyncStorage.setItem('geolocation/permission', 'true|'+(new Date).toString());
            segment.track('Posyt Create - Geo Permission 2 - Granted');
            resolve(true);
          } },
        ],
      );
    });
  }

  async currentLocation() {
    const permission = await AsyncStorage.getItem('geolocation/permission');
    if (permission === null) {
      const permissionGranted = await this.requestGeolocationPermission();
      if (!permissionGranted) return null;
    } else if (permission.search('false') !== -1) {
      return null;
    }
    return await this.getCurrentPosition();
  }

  // TODO: don't allow save if offline
  async save() {
    const { newPosytText, saving } = this.state;
    if (saving || !newPosytText.length) return;
    // this.setState({ saving: true });
    // this.playSavingAnimation();
    const attrs = {};
    attrs.content = newPosytText.trim();
    const location = await this.currentLocation();
    if (location && location.coords) {
      attrs.location = [location.coords.latitude, location.coords.longitude].join(',');
    }
    this.close('up');
    segment.track('Posyt Create - Saving 1 - Request');
    ddp.call("posyts/create", [attrs]).then(() => {
      // this.setState({ saving: false });
      segment.track('Posyt Create - Saving 2 - Success');
    }).catch((err) => {
      // this.setState({ saving: false });
      // Alert.alert('Error', err.reason, [{ text: 'OK' }]);
      segment.track('Posyt Create - Saving 2 - Error', { error: err.reason });
    });
  }

  render() {
    const { yAnim, nAnim, heightAnim, newPosytText, pan,
      saving, savingAnim, charCount } = this.state;

    const underlayAnim = {
      bottom: nAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [-height, 0],
      }),
    };
    const wrapPanAnim = {
      transform: [
        { translateY: pan.y },
        { translateX: pan.x },
      ],
    };
    const wrapAnim = {
      bottom: yAnim,
      height: heightAnim,
    };
    const posytButtonWrapAnim = {
      bottom: nAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [(STARTING_HEIGHT - 50 + 9), 8],
      }),
      transform: [
        {
          scale: savingAnim,
        },
      ],
    };
    if (saving) posytButtonWrapAnim.opacity = 0.3;
    const closeButtonWrapAnim = {
      bottom: nAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [-(STARTING_HEIGHT + 50), 8],
      }),
    };
    const overlayAnim = {
      top: nAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1000],
      }),
    };

    // TODO: MAYBE: on subsequent opens of the infoModal show random example posyts
    //   Or just have a button to write random posyts if you're stuck

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.underlay, underlayAnim]} />
        <Animated.View style={[styles.wrap, wrapPanAnim, wrapAnim]}>
          <View style={styles.inner}>
            <TextInput style={styles.input}
              ref="input"
              placeholder={this.state.placeholder}
              multiline={true}
              maxLength={MAX_CHARS}
              keyboardType="twitter"
              onChangeText={this._onChangeText.bind(this)}
              value={newPosytText}
              selectionColor={red}
              onFocus={() => this.inputIsFocused = true }
              onBlur={() => this.inputIsFocused = false }
              />
            <Animated.View style={[styles.posytButtonWrap, posytButtonWrapAnim]}>
              <TouchableOpacity
                style={[styles.posytButton,
                  newPosytText.length !== 0 && { backgroundColor: red, borderColor: red },
                ]}
                onPress={() => this.save()}
              >
                <Text style={[styles.posytButtonText, newPosytText.length !== 0 && { color: 'white' }]}>Posyt</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.closeButtonWrap, { left: 86 }, closeButtonWrapAnim]}>
              <Text style={styles.charCount}>{charCount}</Text>
            </Animated.View>
            <Animated.View style={[styles.closeButtonWrap, { left: 44 }, closeButtonWrapAnim]}>
              <TouchableOpacity style={[styles.closeButton, { top: -1 }]} onPress={() => { this.refs.infoModal.show('bottom'); segment.screen('Viewed Compose Info Modal') }}>
                <Image style={styles.closeButtonImage} source={require('../../assets/images/info.png')} />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.closeButtonWrap, closeButtonWrapAnim]}>
              <TouchableOpacity style={[styles.closeButton]} onPress={() => this.close()}>
                <Image style={styles.closeButtonImage} source={require('../../assets/images/skip.png')} />
              </TouchableOpacity>
            </Animated.View>
          </View>
          <Animated.View style={[styles.overlay, overlayAnim]} {...this.state.panResponder.panHandlers} />
        </Animated.View>

        <PosytModal key="infoModal" ref="infoModal" style={[styles.modal, { width: 260 }]}>
          <Text style={[styles.modalText, { margin: 10, marginTop: 12, textAlign: 'left', fontSize: 15, lineHeight: 17 }]}>
            {`Anonymously toss posyts into the world. Some people will like them. When it's mutual you'll chat.`}
          </Text>
          <Text style={[styles.modalText, { margin: 10, marginTop: 0, textAlign: 'left', fontSize: 14, lineHeight: 16 }]}>
            {`Code of conduct:\n· No trolling\n· No spamming\n· No bullying`}
          </Text>
          <View style={styles.modalSeparator} />
          <Text style={[styles.modalSubText, { marginTop: 10, marginBottom: 10, marginHorizontal: 5 }]}>
            <Text style={{ fontWeight: '600' }}>pos·yt</Text> | verb/noun | pause'-it | "to put an idea forward as the basis of discussion"
          </Text>
        </PosytModal>
      </View>
    );
  }
}

Compose.propTypes = {
  dispatch: React.PropTypes.func,
};

reactMixin(Compose.prototype, TimerMixin);

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps)(Compose);
