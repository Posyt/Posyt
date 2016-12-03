import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  PanResponder,
  PixelRatio,
} from 'react-native';
import { connect } from 'react-redux';
import {
  setTabBarLocked,
} from '../lib/actions';
import {
  blue,
} from '../lib/constants';
import CardPosyt from './CardPosyt';
import CardArticle from './CardArticle';

const SWIPE_ICON_THRESHOLD = 20;

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // gets actual dimensions onLayout
      height: 300,
      width: 200,
      // -1.0 - 1.0 describing the Y offset of the touch from the middle of the card
      touchNormalY: new Animated.Value(0),
      pan: new Animated.ValueXY(),
    };
    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, g) => true,
      // onMoveShouldSetPanResponder: (e, g) => true, // NOTE: this breaks drag to dismiss in lightboxes
      onPanResponderGrant: (e, g) => {
        // TODO: this dispatch is too slow. the underlying scroll view has time to pan a little before it gets locked
        //   There is a hacky patch in ScrollableTabView that re-centers the current page when the scroll view gets locked
        //   but it's not ideal
        // don't allow swiping the between tabs while moving this
        this.props.dispatch(setTabBarLocked(true));
        this.longTimer = setTimeout(() => {
          this.longPress = true;
        }, 150);
        const cardMidY = (this.state.height / 2);
        const touchY = cardMidY - e.nativeEvent.locationY;
        this.state.touchNormalY.setValue(touchY / cardMidY);
      },
      onPanResponderMove: (e, g) => {
        Animated.event([null, {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        }])(e, g);
        if (this.props.onMove) this.props.onMove(e, g);
      },
      onPanResponderRelease: (e, g) => this._onPanResponderEnd(e,g),
      onPanResponderTerminationRequest: (e, g) => false, // NOTE: this throws a scroll view doesn't take rejection well.
      onPanResponderTerminate: (e, g) => this._onPanResponderEnd(e,g),
    });
    this.resetPan = this.resetPan.bind(this) // Make this available to parent components
  }

  _onPanResponderEnd(e, g) {
    clearTimeout(this.longTimer) // end the press timer

    Animated.decay(this.state.pan, {   // coast to a stop
      velocity: {x: g.vx, y: g.vy}, // velocity from gesture release
      deceleration: 0.999,
    }).start()

    // TODO: if onRelease is defined then only animate back if it returns true
    if (!this.props.onRelease || this.props.onRelease(e, g)) {
      this.resetPan()
      if (!this.longPress) this._onPress();
    }

    this.props.dispatch(setTabBarLocked(false)) // re-enable tab bar swiping
    this.longPress = false // reset longPress
  }

  _onPress() {
    try {
      this.refs.cardContent.getWrappedInstance().onPress();
    } catch (err) {
      if (global.__DEV__) console.log(err);
    }
  }

  _onLayout(e) {
    this.setState({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height, })
  }

  resetPan(animated = true) {
    if (animated) {
      Animated.spring(
        this.state.pan,
        {toValue: {x: 0, y: 0}}
      ).start(); // reset the pan to 0,0
    } else {
      this.state.pan.setValue({x: 0, y: 0})
    }
  }

  render () {
    const { touchNormalY, pan } = this.state
    const { threshold, data } = this.props
    const panXAbs = pan.x.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [1, 0, 1],
    })

    const containerAnim = {
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        { rotate: Animated.multiply(pan.x, touchNormalY).interpolate({
          inputRange: [-20, 0, 20],
          outputRange: ['-1deg', '0deg', '1deg'],
          // extrapolate: 'clamp'
        }) },
      ]
    }

    const swipeIconReportAnim = {
      opacity: Animated.add(pan.y, Animated.multiply(panXAbs, new Animated.Value(-1))).interpolate({
        inputRange: [SWIPE_ICON_THRESHOLD*2, threshold],
        outputRange: [0.0, 1.0],
        extrapolate: 'clamp'
      }),
      transform: [
        {
          scale: Animated.add(pan.y, Animated.multiply(panXAbs, new Animated.Value(-1))).interpolate({
            inputRange: [SWIPE_ICON_THRESHOLD*2, threshold],
            outputRange: [2.0, 1.0],
            extrapolate: 'clamp'
          }),
        },
      ],
    }
    const swipeIconLikeAnim = {
      opacity: pan.x.interpolate({
        inputRange: [SWIPE_ICON_THRESHOLD, threshold],
        outputRange: [0.0, 1.0],
        extrapolate: 'clamp'
      }),
      transform: [
        {
          translateX: pan.x.interpolate({
            inputRange: [SWIPE_ICON_THRESHOLD, threshold],
            outputRange: [-60, 0],
            extrapolate: 'clamp'
          })
        },
        {
          rotateY: pan.x.interpolate({
            inputRange: [SWIPE_ICON_THRESHOLD, threshold],
            outputRange: ['-89deg', '0deg'],
            extrapolate: 'clamp'
          })
        },
        { rotateZ: '2deg' },
        {
          scale: pan.x.interpolate({
            inputRange: [SWIPE_ICON_THRESHOLD, threshold],
            outputRange: [3.0, 1.0],
            extrapolate: 'clamp'
          })
        }
      ]
    }
    const swipeIconSkipAnim = {
      opacity: pan.x.interpolate({
        inputRange: [-threshold, -SWIPE_ICON_THRESHOLD],
        outputRange: [1.0, 0.0],
        extrapolate: 'clamp'
      }),
      transform: [
        {
          translateX: pan.x.interpolate({
            inputRange: [-threshold, -SWIPE_ICON_THRESHOLD],
            outputRange: [0, 60],
            extrapolate: 'clamp'
          })
        },
        {
          rotateY: pan.x.interpolate({
            inputRange: [-threshold, -SWIPE_ICON_THRESHOLD],
            outputRange: ['0deg', '-89deg'],
            extrapolate: 'clamp'
          })
        },
        { rotateZ: '-2deg' },
        {
          scale: pan.x.interpolate({
            inputRange: [-threshold, -SWIPE_ICON_THRESHOLD],
            outputRange: [1.0, 3.0],
            extrapolate: 'clamp'
          }),
        }
      ]
    }
    const swipeIconShareAnim = {
      opacity: Animated.add(pan.y, Animated.multiply(panXAbs, new Animated.Value(1))).interpolate({
        inputRange: [-threshold, -SWIPE_ICON_THRESHOLD*2],
        outputRange: [1.0, 0.0],
        extrapolate: 'clamp'
      }),
      transform: [
        {
          rotateZ: Animated.add(pan.y, Animated.multiply(panXAbs, new Animated.Value(1))).interpolate({
            inputRange: [-threshold*2.2, -threshold*2.0, -threshold*1.8, -threshold*1.6, -threshold*1.4, -threshold*1.2, -threshold, -SWIPE_ICON_THRESHOLD*2],
            outputRange: ['0deg', '10deg', '-10deg', '10deg', '-10deg', '10deg', '0deg', '0deg'],
            extrapolate: 'clamp'
          })
        },
        {
          scale: Animated.add(pan.y, Animated.multiply(panXAbs, new Animated.Value(1))).interpolate({
            inputRange: [-threshold, -SWIPE_ICON_THRESHOLD*2],
            outputRange: [0.5, 0.0],
            // extrapolate: 'clamp'
          })
        },
        {
          translateY: Animated.add(pan.y, Animated.multiply(panXAbs, new Animated.Value(1))).interpolate({
            inputRange: [-threshold, -SWIPE_ICON_THRESHOLD*2],
            outputRange: [-10.0, 0.0],
            // extrapolate: 'clamp'
          })
        },
      ],
    }

    let sharedBy;
    if (data.deepLink && data.deepLink.username) sharedBy = (
      <View style={styles.sharedBy}>
        <Text style={styles.sharedByText}>
          {data.deepLink.username} shared this {data.deepLink._type} with you
        </Text>
        <Text style={styles.sharedBySubText}>
          Swipe right and maybe you'll see{"\n"}what else interests {data.deepLink.username}
        </Text>
      </View>
    )

    let cardContent;
    // TODO: tapping a card to open it in a webview should start the open timer
    if (data._type === 'posyt') {
      cardContent = <CardPosyt posyt={data} ref="cardContent" />
    } else if (data._type === 'article') {
      cardContent = <CardArticle article={data} ref="cardContent" />
    }

    return (
      <Animated.View style={[styles.container, this.props.style && this.props.style, containerAnim]} onLayout={(e) => this._onLayout(e)}>
        <View style={styles.inner} {...this.state.panResponder.panHandlers}>
          {sharedBy}
          {cardContent}
        </View>
        <View style={styles.swipeIconsWrap} pointerEvents={'none'}>
          <View style={[styles.swipeIconsRow]}>
            <View style={[styles.swipeIconWrap, styles.swipeIconWrapReport]}>
              <Animated.Text style={[styles.swipeIcon, styles.swipeIconReport, swipeIconReportAnim]}>️️
                👮
              </Animated.Text>
            </View>
          </View>
          <View style={[styles.swipeIconsRow]}>
            <View style={[styles.swipeIconWrap, styles.swipeIconWrapLike]}>
              <Animated.Text style={[styles.swipeIcon, styles.swipeIconLike, swipeIconLikeAnim]}>
                😀
              </Animated.Text>
            </View>
            <View style={[styles.swipeIconWrap, styles.swipeIconWrapSkip]}>
              <Animated.Text style={[styles.swipeIcon, styles.swipeIconSkip, swipeIconSkipAnim]}>
                😐
              </Animated.Text>
            </View>
          </View>
          <View style={[styles.swipeIconsRow]}>
            <View style={[styles.swipeIconWrap, styles.swipeIconWrapShare]}>
              <Animated.Text style={[styles.swipeIcon, styles.swipeIconShare, swipeIconShareAnim]}>
                🎉
              </Animated.Text>
            </View>
          </View>
        </View>
      </Animated.View>
    )
  }
}

Card.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  threshold: React.PropTypes.number.isRequired,
  onMove: React.PropTypes.func.isRequired,
  onRelease: React.PropTypes.func.isRequired,
  data: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    borderRadius: 4,
    marginBottom: 5,
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
    // borderBottomWidth: 2 / PixelRatio.get(),
    borderColor: '#ddd',
    backgroundColor: 'white',
  },

  sharedBy: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: blue,
  },
  sharedByText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Rooney Sans',
    marginTop: 4,
  },
  sharedBySubText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Rooney Sans',
    marginTop: 2,
  },

  swipeIconsWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  swipeIconsRow: {
    flex: 1,
    flexDirection: 'row',
  },
  swipeIconWrap: {
    flex: 1,
    // shadowColor: 'black',
    // shadowOffset: { width: 1, height: 1 },
    // shadowOpacity: 0.8,
    // shadowRadius: 2,
  },
  swipeIcon: {
    opacity: 0,
    fontSize: 60,
    paddingBottom: 2,
    marginBottom: -2,
  },

  swipeIconWrapReport: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  swipeIconReport: {
  },

  swipeIconWrapLike: {
    marginLeft: 40,
    marginTop: -100,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  swipeIconLike: {
  },

  swipeIconWrapSkip: {
    marginRight: 40,
    marginTop: -100,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  swipeIconSkip: {
  },

  swipeIconWrapShare: {
    marginTop: -100,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  swipeIconShare: {
    fontSize: 70,
  },
});

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })(Card);
