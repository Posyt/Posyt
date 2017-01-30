import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SegmentedControlIOS,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  Animated,
  PixelRatio,
} from 'react-native';
import { connect } from 'react-redux';
import segment from '../lib/segment';
import _ from 'lodash';
import LinearGradient from 'react-native-linear-gradient';
import {
  black,
  grey,
  blue,
  lightGrey,
  lightGreyRGB,
  sources as allSources,
  sourcesIcons,
} from '../lib/constants';
import { ddp } from '../lib/DDP';
import bugsnag from '../lib/bugsnag';

const iconSize = 36;
const iconMarginRight = 5;

const styles = StyleSheet.create({
  container: {
    // marginTop: -2,
    marginBottom: 5,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
  },
  segmentedControl: {
    flex: 2,
    height: 24,
  },
  feedsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  feedsButtonText: {
    fontFamily: 'Rooney Sans',
    fontWeight: '500',
    fontSize: 14,
    color: black,
  },
  feedsButtonChevron: {
    marginLeft: 6,
    marginTop: 1,
    width: 12,
    height: 12,
    transform: [{ rotate: '-180deg' }],
    tintColor: black,
  },
  feeds: {
    position: 'relative',
    overflow: 'hidden',
    // backgroundColor: 'white',
    // borderTopWidth: 1 / PixelRatio.get(),
    // borderBottomWidth: 1 / PixelRatio.get(),
    // borderColor: '#ddd',
  },
  feedsScrollView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
  },
  feedButton: {
    marginRight: iconMarginRight,
  },
  feedIconWrap: {
    position: 'relative',
    width: iconSize,
    height: iconSize,
  },
  feedIcon: {
    width: iconSize,
    height: iconSize,
  },
  feedIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    tintColor: lightGrey,
    opacity: 0.6,
  },
  feedsSwitch: {
    marginTop: 3,
    transform: [{ scale: 0.8 }],
  },
  feedsGradientLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
  },
  feedsGradientRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
  },
});

class CardsFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      feedsHeight: new Animated.Value(0),
      sources: [...allSources],
    };
    this.showFeeds = false;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.currentUser || !nextProps.currentUser ||
      this.props.currentUser.profile.disabledSources !== nextProps.currentUser.profile.disabledSources) {
      const disabledSources = _.get(nextProps, 'currentUser.profile.disabledSources', []);
      this.setState({ sources: _.difference(allSources, disabledSources) });
    }
  }

  onChangeOrder = (order) => {
    ddp.call('users/sortLeadsBy/set', [order.toLowerCase()]).catch((err) => {
      if (global.__DEV__) console.log('Error setting feeds:', err);
      // this.setState({ sources }); // rollback
      Alert.alert('That\'s weird', 'We could not save this change to the server. Please try again later. The server is probably undergoing maintinence.')
      bugsnag.notify(err);
    }).then(() => {
      segment.track(`Change Order To ${order}`);
    });
    // TODO: make sure to pull the default order off the user
  }

  showHideFeeds = () => {
    Animated.timing(
      this.state.feedsHeight,
      { toValue: this.showFeeds ? 0 : iconSize, duration: 200 }
    ).start();
    this.showFeeds = !this.showFeeds;
    segment.track(`Toggle Feeds ${this.showFeeds ? 'Open' : 'Closed'}`);
  }

  togglePosyts = () => {
    Alert.alert('Posyts cannot be hidden');
    segment.track('Attempt - Press Toggle Posyts Off');
  }

  toggle(source) {
    const sources = this.state.sources;
    const disabledSources = _.get(this.props, 'currentUser.profile.disabledSources', []);
    const on = disabledSources.includes(source);
    if (on) _.pull(disabledSources, source);
    if (!on) disabledSources.push(source);
    this.setState({ sources: _.difference(allSources, disabledSources) });
    ddp.call('users/disabledSources/set', [disabledSources]).catch((err) => {
      if (global.__DEV__) console.log('Error setting feeds:', err);
      this.setState({ sources }); // rollback
      Alert.alert('That\'s weird', 'We could not save this change to the server. Please try again later. The server is probably undergoing maintinence.')
      bugsnag.notify(err);
    }).then(() => {
      segment.track(`Toggle ${source} Feed ${on ? 'On' : 'Off'}`);
    });
  }

  toggleAll = (on) => {
    const disabledSources = on ? [] : allSources;
    this.setState({ sources: _.difference(allSources, disabledSources) });
    ddp.call("users/disabledSources/set", [disabledSources]).catch(err => {
      if (global.__DEV__) console.log("Error setting feeds:", err);
      this.setState({ sources }); // rollback
      Alert.alert('That\'s weird', 'We could not save this change to the server. Please try again later. The server is probably undergoing maintinence.')
      bugsnag.notify(err);
    }).then(() => {
      segment.track(`Toggle All Feeds ${on ? 'On' : 'Off'}`);
    });
  }

  render() {
    const { feedsHeight, sources } = this.state;
    const { currentUser } = this.props;
    const toggledAny = sources.length > 0;

    const feedsScale = feedsHeight.interpolate({
      inputRange: [0, iconSize],
      outputRange: [0, 1],
    });

    const chevronRotate = feedsHeight.interpolate({
      inputRange: [0, iconSize],
      outputRange: ['-180deg', '0deg'],
    });

    return (
      <View style={styles.container}>
        <View style={styles.top}>
          <SegmentedControlIOS
            style={styles.segmentedControl}
            tintColor={black}
            values={['New', 'Trending']}
            selectedIndex={{ new: 0, trending: 1 }[_.get(currentUser, 'profile.sortLeadsBy', 'trending')]}
            onValueChange={this.onChangeOrder}
          />
          <TouchableOpacity style={styles.feedsButton} onPress={this.showHideFeeds}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.feedsButtonText}>
                Feeds
              </Text>
              <Animated.Image source={require('../../assets/images/chevron_down.png')} style={[styles.feedsButtonChevron, { transform: [{ rotate: chevronRotate }] }]} />
            </View>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.feeds, { height: feedsHeight, transform: [{ scale: feedsScale }] }]}>
          <ScrollView
            style={styles.feedsScrollView}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={iconSize + iconMarginRight}
          >
            <TouchableOpacity key='Posyt' onPress={this.togglePosyts} style={styles.feedButton}>
              <Image source={require('../../assets/images/feed_posyt.png')} style={styles.feedIcon} />
            </TouchableOpacity>
            {allSources.map(source => {
              const active = sources.includes(source);
              return (
                <TouchableOpacity key={source} onPress={() => this.toggle(source)} style={styles.feedButton}>
                  <View style={styles.feedIconWrap}>
                    <Image source={sourcesIcons[source]} style={styles.feedIcon} blurRadius={active ? 0 : 2} />
                    <Image source={sourcesIcons[source]} style={[styles.feedIcon, styles.feedIconOverlay, active && { opacity: 0 }]} blurRadius={active ? 0 : 2} />
                  </View>
                </TouchableOpacity>
              )
            })}
            <Switch onValueChange={this.toggleAll} value={toggledAny} onTintColor={blue} style={styles.feedsSwitch} />
          </ScrollView>
          <LinearGradient
            start={[1, 0]}
            end={[0, 0]}
            colors={[`rgba(${lightGreyRGB},0)`, `rgba(${lightGreyRGB},1)`]}
            style={styles.feedsGradientLeft}
            pointerEvents="none"
          />
          <LinearGradient
            start={[0, 0]}
            end={[1, 0]}
            colors={[`rgba(${lightGreyRGB},0)`, `rgba(${lightGreyRGB},1)`]}
            style={styles.feedsGradientRight}
            pointerEvents="none"
          />
        </Animated.View>
      </View>
    );
  }
}


CardsFilter.propTypes = {
  currentUser: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

export default connect(mapStateToProps)(CardsFilter);
