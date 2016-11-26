import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  PushNotificationIOS,
  PixelRatio,
  TouchableOpacity,
  Animated
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  gold,
  blue,
} from '../lib/constants';
import {
  showConversation,
} from '../lib/actions';

const { width } = Dimensions.get('window');

// NOTE: This is just for testing.
function renderTestNotifications() {
  if (global.__DEV__) {
    setTimeout(() => {
      require('RCTDeviceEventEmitter').emit('remoteNotificationReceived', {
        aps: {
          alert: 'New Match with Chris',
          badge: '+1',
          sound: 'default',
          category: 'REACT_NATIVE',
        },
        conversationId: 'ctJAzAQJy9Hz9hkQH',
        firstName: 'Chris',
        content: 'FBI Cracks Down on Tech Companies for Encrypting all Communication',
        type: 'match',
        remote: true,
      });
      setTimeout(() => {
        require('RCTDeviceEventEmitter').emit('remoteNotificationReceived', {
          aps: {
            alert: 'New Message from Chris',
            badge: '+1',
            sound: 'default',
            category: 'REACT_NATIVE',
          },
          conversationId: 'ctJAzAQJy9Hz9hkQH',
          firstName: 'Chris',
          content: 'Whoa',
          type: 'message',
          remote: true,
        });
        // setTimeout(() => {
        //   require('RCTDeviceEventEmitter').emit('remoteNotificationReceived', {
        //     aps: {
        //       alert: 'New Message from Chris',
        //       badge: '+1',
        //       sound: 'default',
        //       category: 'REACT_NATIVE',
        //     },
        //     conversationId: 'ctJAzAQJy9Hz9hkQH',
        //     firstName: 'Chris',
        //     content: 'What\'s up?',
        //     type: 'message',
        //     remote: true,
        //   });
        //   setTimeout(() => {
        //     require('RCTDeviceEventEmitter').emit('remoteNotificationReceived', {
        //       aps: {
        //         alert: 'New Message from Chris',
        //         badge: '+1',
        //         sound: 'default',
        //         category: 'REACT_NATIVE',
        //       },
        //       conversationId: 'ctJAzAQJy9Hz9hkQH',
        //       firstName: 'Chris',
        //       content: 'What\'s up?',
        //       type: 'message',
        //       remote: true,
        //     });
        //   }, 4000);
        // }, 1000);
      }, 3000);
    }, 5000);
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: width - 20,
    backgroundColor: 'transparent',
  },
  notification: {
    flex: 1,
    height: 60,
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: gold,
    // borderColor: '#999',
    // borderWidth: 1 / PixelRatio.get(),
    borderRadius: 3,
    // overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 / PixelRatio.get() },
    shadowOpacity: 0.45,
    shadowRadius: 1,
    padding: 10,
  },
  message: {
    // textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Rooney Sans',
    marginTop: 1,
    backgroundColor: 'transparent',
  },
  content: {
    // textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Rooney Sans',
    marginTop: 4,
    backgroundColor: 'transparent',
  },
});

class PushNotificationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
    };
    this.onNotification = this.onNotification.bind(this);
  }

  componentWillMount() {
    this.handleOpenFromPush();
    PushNotificationIOS.addEventListener('notification', this.onNotification);
    // NOTE: COMMENT OUT: TESTING ONLY:
    // if (global.__DEV__) PushNotificationIOS.requestPermissions();
    // if (global.__DEV__) renderTestNotifications();
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('notification', this.onNotification);
  }

  onNotification(notification) {
    // if (global.__DEV__) console.log('PushNotification:', notification);
    const data = notification && notification.getData();
    // Don't show notifications if you're already viewing that conversation
    if (data && data.conversationId && data.conversationId !== this.props.conversationId) {
      const notificationWithId = _.assignIn(notification, {
        id: _.uniqueId(),
        pan: new Animated.ValueXY({ x: -600, y: 0 }),
        opacity: new Animated.Value(0),
        height: new Animated.Value(0),
        // TODO: add a panResponder so you can swipe left or right to dismiss a notification
      });
      this.setState({ notifications: [notificationWithId, ...this.state.notifications] });
      this.animateNotificationOn(notification);
    }
  }

  onPressNotification(notification) {
    const data = notification && notification.getData();
    if (data && data.conversationId && data.conversationId !== this.props.conversationId) {
      this.props.dispatch(showConversation(data.conversationId));
    }
    if (notification && notification.id) this.animateNotificationOff(notification);
  }

  handleOpenFromPush() {
    PushNotificationIOS.getInitialNotification((notification) => {
      this.onPressNotification(notification);
    });
  }

  animateNotificationOn(notification) {
    Animated.parallel([
      Animated.spring(
        notification.pan,
        { toValue: { x: 0, y: 0 } }
      ),
      Animated.spring(
        notification.opacity,
        { toValue: 1 }
      ),
      Animated.spring(
        notification.height,
        { toValue: 60 }
      ),
    ]).start(() => {
      setTimeout(() => {
        this.animateNotificationOff(notification);
      }, 4000);
    });
  }

  animateNotificationOff(notification) {
    if (_.find(this.state.notifications, { id: notification.id })) {
      Animated.parallel([
        Animated.timing(
          notification.pan,
          { toValue: { x: 500, y: 0 } }
        ),
        Animated.timing(
          notification.opacity,
          { toValue: 0 }
        ),
      ]).start(() => {
        this.setState({
          notifications: _.filter(this.state.notifications, (n) => n.id !== notification.id),
        });
      });
    }
  }

  render() {
    const { notifications } = this.state;
    if (!notifications || !notifications.length) return null;
    return (
      <View style={styles.container}>
        <StatusBar hidden={false} />
        {notifications.map((notification, i) => {
          const message = notification.getMessage();
          const data = notification.getData();
          const anim = {
            transform: notification.pan.getTranslateTransform(),
            opacity: notification.opacity,
            height: notification.height,
          };
          return (
            <Animated.View
              key={notification.id}
              style={[styles.notificationWrap, anim]}
            >
              <TouchableOpacity
                style={[styles.notification,
                  data.type === 'message' && { backgroundColor: blue },
                  i !== 0 && { marginTop: 5 },
                ]}
                activeOpacity={0.7}
                onPress={() => this.onPressNotification(notification)}
              >
                <View>
                  <Text style={[styles.message, data.type === 'message' && { color: 'white' }]}
                    numberOfLines={1}
                  >
                    {message}:
                  </Text>
                  <Text style={[styles.content, data.type === 'message' && { color: 'white' }]}
                    numberOfLines={1}
                  >
                    {data.content}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  }
}

PushNotificationBar.propTypes = {
  dispatch: React.PropTypes.func,
  conversationId: React.PropTypes.string,
};

function mapStateToProps(state) {
  return {
    conversationId: state.chat.conversationId,
  };
}

export default connect(mapStateToProps)(PushNotificationBar);
