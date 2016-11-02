import React from 'react';
import { StyleSheet, Modal, View, Animated, TouchableWithoutFeedback, Dimensions, PixelRatio, PanResponder, DeviceEventEmitter, Easing } from 'react-native';
import TimerMixin from 'react-timer-mixin';
import reactMixin from 'react-mixin';
// import { VibrancyView } from 'react-native-blur';

const { width, height } = Dimensions.get('window');
const THRESHOLD = width / 2;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // width,
    height,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  underlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'transparent',
    // opacity: 0,
  },
  shaker: {
    flex: 0,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginHorizontal: 30,
    marginVertical: 100,
  },
  content: {
    flex: 0,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  contentShadow: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 / PixelRatio.get() },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  inner: {
    flex: 0,
    // minHeight: 100,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: 4,
    // borderWidth: 1 / PixelRatio.get(),
    // borderColor: '#ddd',
  },
});

class PosytModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      direction: 'top',
      visible: false,
      height: 10, // gets actual dimensions onLayout
      width: 10,
      touchNormalY: new Animated.Value(1.0), // -1.0 - 1.0 describing the Y offset of the touch from the middle of the card
      pan: new Animated.ValueXY(),
      screenHeight: new Animated.Value(height),
      shake: new Animated.Value(0.0),
    }
    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, g) => true,
      onMoveShouldSetPanResponder: (e, g) => {
        if (this.props.disableSwipe) return false;
        if (this.props.disableVerticalSwipe) return Math.abs(g.dx) > Math.abs(g.dy);
        if (this.props.disableHorizontalSwipe) return Math.abs(g.dx) < Math.abs(g.dy);
        return true;
      },
      onPanResponderGrant: (e, g) => {
        this.longTimer = setTimeout(() => this.longPress = true, 150);
        const modalMidY = this.state.height / 2;
        const pageMidY = height / 2;
        const touchY = pageMidY - e.nativeEvent.pageY;
        this.state.touchNormalY.setValue(touchY / modalMidY);
      },
      onPanResponderMove: (e, g) => {
        Animated.event([null, {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        }])(e, g);
      },
      onPanResponderRelease: (e, g) => this._onPanResponderEnd(e,g),
      onPanResponderTerminationRequest: (e, g) => false, // NOTE: this throws a scroll view doesn't take rejection well.
      onPanResponderTerminate: (e, g) => this._onPanResponderEnd(e,g),
    });
    this.show = this.show.bind(this);
    this.shake = this.shake.bind(this);
  }

  componentWillMount() {
    DeviceEventEmitter.addListener('keyboardWillShow', e => {
      Animated.spring(
        this.state.screenHeight
        , { toValue: e.endCoordinates.screenY, speed: 4, bounciness: 8 }
      ).start();
    });
    DeviceEventEmitter.addListener('keyboardWillHide', e => {
      Animated.spring(
        this.state.screenHeight
        , { toValue: e.endCoordinates.screenY, speed: 12, bounciness: 8 }
      ).start();
    });
  }

  componentDidMount() {
    if (this.props.alwaysVisible) this.show();
  }

  _onPanResponderEnd(e, g) {
    clearTimeout(this.longTimer); // end the press timer

    Animated.decay(this.state.pan, {   // coast to a stop
      velocity: { x: g.vx, y: g.vy }, // velocity from gesture release
      deceleration: 0.999,
    }).start();

    // TODO: if onRelease is defined then only animate back if it returns true
    if (Math.abs(g.dx) + Math.abs(g.dy) > THRESHOLD) {
      const gg = { dx: g.dx, dy: g.dy };
      setTimeout(() => {
        if (this.props.alwaysVisible) {
          this.state.pan.setValue({ x: gg.dx * 3 * -1, y: gg.dy * 3 * -1 });
          this.resetPan();
        } else {
          this.setState({ visible: false });
          if (this.props.onDismiss) this.props.onDismiss();
        }
      }, 200);
    } else {
      this.resetPan();
    }

    this.longPress = false; // reset longPress
  }

  resetPan(animated = true) {
    if (animated) {
      Animated.spring(
        this.state.pan,
        { toValue: { x: 0, y: 0 } }
      ).start(); // reset the pan to 0,0
    } else {
      this.state.pan.setValue({ x: 0, y: 0 });
    }
  }

  show(direction = 'top', cb) {
    this.state.pan.setValue(this.panCoordsFromDirection(direction));
    this.state.touchNormalY.setValue(1);
    this.setState({ visible: true, direction });
    this.requestAnimationFrame(() => {
      this.resetPan();
      setTimeout(() => {
        if (cb) cb();
        if (this.props.onShow) this.props.onShow();
      }, 200);
    });
  }

  hide(direction = this.state.direction, cb) {
    this.requestAnimationFrame(() => {
      if (this.props.alwaysVisible && direction === 'top') direction = 'bottom';
      Animated.spring(this.state.pan, {
        toValue: this.panCoordsFromDirection(direction),
      }).start();
      setTimeout(() => {
        if (this.props.alwaysVisible) {
          this.show();
        } else {
          this.setState({ visible: false });
        }
        setTimeout(() => {
          if (cb) cb();
        }, 16);
      }, 200);
    });
  }

  shake() {
    Animated.sequence([
      Animated.timing(this.state.shake, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(this.state.shake, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }

  panCoordsFromDirection(direction) {
    let x = 0;
    let y = 0;
    switch (direction) {
      case 'left': x = -height; break;
      case 'right': x = height; break;
      case 'top': y = -height; break;
      case 'bottom': y = height; break;
    }
    return { x, y };
  }

  _onLayout(e) {
    this.setState({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.alwaysVisible !== nextProps.alwaysVisible) nextProps.alwaysVisible ? setTimeout(this.show, 300) : this.hide();
  }

  render() {
    const { visible, touchNormalY, pan, screenHeight, shake, direction } = this.state;
    const { style, onDismiss } = this.props;

    const contentAnim = {
      transform: [
        ...pan.getTranslateTransform(),
        {
          rotate: Animated.multiply(Animated.add(pan.x, pan.y), touchNormalY).interpolate({
            inputRange: [-30, 0, 30],
            outputRange: ['-1deg', '0deg', '1deg'],
          }),
        },
      ],
    };

    const shakeAnim = {
      transform: [
        {
          translateX: shake.interpolate({
            inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
            outputRange: [0, 6, 0, -6, 0, 6],
          }),
        },
      ],
    };

    return (
      <Modal
        animationType="none"
        visible={visible}
        transparent
      >
        <Animated.View style={[styles.container, { height: screenHeight }]}>
          <TouchableWithoutFeedback onPress={() => this.hide(direction, onDismiss)}>
            <View blurType="xlight" style={styles.underlay} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.shaker,
              this.state.width && { width: this.state.width },
              shakeAnim]}
          >
            <Animated.View style={[styles.content,
                this.state.width && { width: this.state.width },
                visible && styles.contentShadow,
                contentAnim]}
              {...this.state.panResponder.panHandlers}
            >
              <View style={[styles.inner, style && style]}
                onLayout={(e) => this._onLayout(e)}
              >
                {this.props.children}
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }
}

PosytModal.propTypes = {
  style: React.PropTypes.any,
  alwaysVisible: React.PropTypes.bool,
  onShow: React.PropTypes.func,
  onDismiss: React.PropTypes.func, // NOTE: this is only called when the modal is manually dismissed by swiping it away or tapping on the underlay
  children: React.PropTypes.any.isRequired,
  disableSwipe: React.PropTypes.bool,
  disableVerticalSwipe: React.PropTypes.bool,
  disableHorizontalSwipe: React.PropTypes.bool,
};

reactMixin(PosytModal.prototype, TimerMixin);

export default PosytModal;
