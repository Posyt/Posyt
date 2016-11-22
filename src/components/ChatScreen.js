import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ListView,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  LayoutAnimation,
  Image,
  AsyncStorage,
  Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import TimerMixin from 'react-timer-mixin';
import reactMixin from 'react-mixin';
import {
  pageChat,
  updateChat,
  popScene,
  sendMessage,
  leaveChat,
} from '../lib/actions';
import {
  grey,
  red,
} from '../lib/constants';
import { ddp } from '../lib/DDP';
import segment from '../lib/segment';
import { promptForFeedback } from '../lib/feedback';
import Bubble from './Bubble';

const { height, width } = Dimensions.get('window');


const styles = StyleSheet.create({
  container: {
    top: 0,
    backgroundColor: 'white',
    position: 'relative',
    height, // This is overridden on keyboard show/hide
  },

  navBar: {
    height: 60,
    paddingTop: 20,
    backgroundColor: 'white',
    // borderBottomWidth: 1 / PixelRatio.get(),
    // borderColor: grey,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: 6,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backImage: {
    width: 24,
    height: 24,
    tintColor: 'black',
  },
  rightButton: {
    marginRight: 6,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantsWrap: {
    flex: 1,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particpant: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Rooney Sans',
  },

  listView: {
    flex: 1,
    paddingTop: 10,
  },

  dividerTop: {
    position: 'absolute',
    top: 60,
    left: -50,
    width: width + 100,
    opacity: 0.5,
  },

  chatBar: {
    position: 'relative',
    height: 50, // This is overridden on input resize
    backgroundColor: 'white',
    // borderTopWidth: 1 / PixelRatio.get(),
    // borderColor: grey,
    flexDirection: 'row',
  },
  dividerBottom: {
    position: 'absolute',
    top: -10,
    left: -50,
    width: width + 100,
    transform: [{ rotate: '180deg' }],
    opacity: 0.5,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 10,
    fontSize: 18,
    fontFamily: 'Rooney Sans',
  },
  sendButton: {
    flex: 0,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 9,
    alignSelf: 'flex-end',
  },
  sendText: {
    fontSize: 18,
    fontFamily: 'Rooney Sans',
    color: grey,
  },
});

class ChatScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      screenY: height,
      inputHeight: 45,
      scrollY: new Animated.Value(0),
    };
    this.listHeight = 999;
  }

  componentWillMount() {
    this._subscriptions = [];
    this._subscriptions.push(Keyboard.addListener('keyboardWillShow', (frames) => this.updateKeyboardSpace(frames)));
    this._subscriptions.push(Keyboard.addListener('keyboardWillHide', (frames) => this.updateKeyboardSpace(frames)));
    // this._subscriptions.push(Keyboard.addListener('keyboardWillChangeFrame', (frames) => this.updateKeyboardSpace(frames)));
  }

  componentDidMount() {
    this.subscribe(this.props.conversationId, this.props.limit);
    segment.screen('Viewed Chat');
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.limit !== nextProps.limit || this.props.loggedIn !== nextProps.loggedIn) {
      ddp.unsubscribe(this.subId, { keepData: true });
      this.subscribe(nextProps.conversationId, nextProps.limit);
    }
  }

  componentWillUnmount() {
    this.promptForRating();
    ddp.unsubscribe(this.subId);
    this._subscriptions.forEach(
      (subscription) => subscription.remove()
    );
    this._subscriptions = null;
    this.props.dispatch(leaveChat());
  }

  async promptForRating() {
    const rowCount = this.props.dataSource.getRowCount();
    const threeWeeks = 1000 * 60 * 60 * 24 * 21;
    const prompted = await AsyncStorage.getItem('feedback/prompted');
    const pressed = await AsyncStorage.getItem('rateApp/pressed');
    // TODO: require longer rowCount before showing prompt once app is bigger
    if (pressed === null && rowCount >= 20 &&
      (prompted === null || new Date(+new Date(prompted) + threeWeeks) < new Date)) {
      AsyncStorage.setItem('feedback/prompted', (new Date).toString());
      promptForFeedback();
    }
  }

  updateKeyboardSpace(frames) {
    LayoutAnimation.configureNext(LayoutAnimation.create(
      frames.duration,
      LayoutAnimation.Types[frames.easing]
    ));
    this.setState({
      screenY: frames.endCoordinates.screenY,
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

  subscribe(conversationId, limit) {
    ddp.subscribe('Chat', [conversationId, limit]).then((id) => { this.subId = id; });
  }

  async currentLocation() {
    const permission = await AsyncStorage.getItem('geolocation/permission');
    if (permission === null) {
      // NOTE: we could always prompt for permission here, but this is probably not the place to ask.
      return null;
    } else if (permission.search('false') !== -1) {
      return null;
    }
    return await this.getCurrentPosition();
  }

  async send() {
    const attrs = {
      content: this.state.text,
      conversationId: this.props.conversationId,
    };
    const location = await this.currentLocation();
    if (location && location.coords) {
      attrs.location = [location.coords.latitude, location.coords.longitude].join(',');
    }
    this.refs.listView.scrollTo({ y: 0 });
    this.props.dispatch(sendMessage(attrs));
    this.resetInput();
  }

  resetInput() {
    this.setState({
      text: '',
      inputHeight: 45,
    });
  }

  renderParticipants() {
    const { participants } = this.props;
    const notMe = participants.filter(p => p._id !== ddp.userId);
    return (
      <View style={styles.participantsWrap}>
        {notMe.map((p, i, a) => (
          <Text key={i} style={styles.particpant}>
            {p.username}
            {i < a.length - 1 && " | "}
          </Text>
        ))}
      </View>
    );
  }

  renderRow(data) {
    return (
      <Bubble key={`${data._type}_${data._id}_${data.date}`} data={data} />
    );
  }

  render() {
    const { dataSource, dispatch, conversationId } = this.props;
    const { screenY, text, inputHeight, scrollY } = this.state;
    const canSend = text.length;

    const listViewHeight = this.refs.listView && this.refs.listView.scrollProperties.offset || 999;
    const dividerTopAnim = {
      opacity: scrollY.interpolate({
        inputRange: [listViewHeight - 20, listViewHeight],
        outputRange: [0.5, 0],
        extrapolate: 'clamp',
      }),
    };

    const dividerBottomAnim = {
      opacity: scrollY.interpolate({
        inputRange: [0, 20],
        outputRange: [0, 0.5],
        extrapolate: 'clamp',
      }),
    };

    return (
      <View style={[styles.container, { height: screenY }]}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => dispatch(popScene())}>
            <Image source={require('../../assets/images/back_solid.png')} style={styles.backImage} />
          </TouchableOpacity>
          {this.renderParticipants()}
          <View style={styles.rightButton} />
        </View>
        <ListView
          ref="listView"
          style={styles.listView}
          renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
          dataSource={dataSource}
          renderRow={this.renderRow.bind(this)}
          onEndReached={() => {
            this.requestAnimationFrame(() => {
              dispatch(pageChat());
              dispatch(updateChat());
            });
          }}
          onEndReachedThreshold={300}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps={true}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }]
          )}
          scrollEventThrottle={16}
          enableEmptySections={true}
        />
        <Animated.Image source={require('../../assets/images/divider.png')} style={[styles.dividerTop, dividerTopAnim]} />
        <View style={[styles.chatBar, { height: inputHeight }]}>
          <Animated.Image source={require('../../assets/images/divider.png')} style={[styles.dividerBottom, dividerBottomAnim]} />
          <TextInput style={[styles.input]}
            ref="input"
            placeholder="Type a message..."
            multiline
            autoFocus
            value={text}
            keyboardType="twitter"
            selectionColor={red}
            onLayout={(e) => {
              this.setState({
                inputHeight: Math.min(e.nativeEvent.layout.height, 200),
              });
            }}
            onChange={(e) => {
              console.log(e.nativeEvent)
              this.setState({
                text: e.nativeEvent.text,
                inputHeight: Math.min(e.nativeEvent.contentSize.height, 200),
              });
            }}
            onChangeText={() => {
              ddp.call('conversations/setTyping', [conversationId]);
            }}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => this.send()} disabled={!canSend}>
            <Text style={[styles.sendText, canSend && { color: red }]}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

ChatScreen.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  loggedIn: React.PropTypes.bool.isRequired,
  conversationId: React.PropTypes.string.isRequired,
  limit: React.PropTypes.number.isRequired,
  participants: React.PropTypes.array.isRequired,
  dataSource: React.PropTypes.instanceOf(ListView.DataSource).isRequired,
};

reactMixin(ChatScreen.prototype, TimerMixin);

function mapStateToProps(state) {
  const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
  return {
    loggedIn: state.auth.loggedIn,
    conversationId: state.chat.conversationId,
    limit: state.chat.limit,
    participants: state.chat.participants,
    dataSource: ds.cloneWithRows(state.chat.bubbles),
  };
}

export default connect(mapStateToProps)(ChatScreen);
