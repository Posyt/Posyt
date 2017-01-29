import React from 'react';
import {
  StyleSheet,
  View,
  SegmentedControlIOS,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import segment from '../lib/segment';
import _ from 'lodash';
import LinearGradient from 'react-native-linear-gradient';
import {
  lightBlack,
  blue,
  lightGrey,
  lightGreyRGB,
  sources as allSources,
  sourcesIcons,
} from '../lib/constants';
import { ddp } from '../lib/DDP';
import bugsnag from '../lib/bugsnag';

const styles = StyleSheet.create({
  container: {
    // marginTop: -2,
    marginBottom: 5,
    overflow: 'hidden',
  },
  segmentedControl: {
    marginLeft: 10,
    marginRight: 10,
    height: 24,
  },
  feeds: {
    position: 'relative',
    marginTop: 5,
  },
  feedsScrollView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
  },
  feedButton: {
    marginRight: 5,
  },
  feedIconWrap: {
    position: 'relative',
    width: 30,
    height: 30,
  },
  feedIcon: {
    width: 30,
    height: 30,
  },
  feedIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    tintColor: lightGrey,
    opacity: 0.6,
  },
  feedsGradientLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  feedsGradientRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
});

class CardsFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sources: [...allSources],
    };
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

  componentWillReceiveProps(nextProps) {
    if (!this.props.currentUser || !nextProps.currentUser ||
      this.props.currentUser.profile.disabledSources !== nextProps.currentUser.profile.disabledSources) {
      const disabledSources = _.get(nextProps, 'currentUser.profile.disabledSources', []);
      this.setState({ sources: _.difference(allSources, disabledSources) });
    }
  }

  render() {
    const { sources, scrollY } = this.state;
    const toggledAny = sources.length > 0;

    return (
      <View style={styles.container}>
        <SegmentedControlIOS
          style={styles.segmentedControl}
          tintColor={lightBlack}
          values={['New', 'Hot', 'Popular']}
          selectedIndex={1}
        />
        <View style={styles.feeds}>
          <ScrollView
            style={styles.feedsScrollView}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <TouchableOpacity key='Posyt' onPress={this.togglePosyts} style={styles.feedButton}>
              <Image source={require('../../assets/images/feed_posyt.png')} style={styles.feedIcon} />
            </TouchableOpacity>
            {allSources.map(source => {
              const active = sources.includes(source);
              return (
                <TouchableOpacity key={source} onPress={() => this.toggle(source)} style={styles.feedButton}>
                  <View style={styles.feedIconWrap}>
                    <Image source={sourcesIcons[source]} style={styles.feedIcon} blurRadius={active ? 0 : 4} />
                    <Image source={sourcesIcons[source]} style={[styles.feedIcon, styles.feedIconOverlay, active && { opacity: 0 }]} blurRadius={active ? 0 : 4} />
                  </View>
                </TouchableOpacity>
              )
            })}
            <Switch onValueChange={this.toggleAll} value={toggledAny} onTintColor={blue} style={{ transform: [{scale: 0.7}] }} />
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
        </View>
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
