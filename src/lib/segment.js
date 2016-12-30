// import af from 'react-native-apps-flyer';
import {
  appId,
  appsflyerDevKey,
} from './constants';

const { NativeModules, Platform } = require('react-native');

const rnSegment = Platform.OS === 'ios' ? NativeModules.RNSegment : null;

class Segment {
  setupWithConfiguration = (writeKey, debug = false) => {
    if(!rnSegment) {
      return;
    }

    rnSegment.setupWithConfiguration(writeKey, debug);
    af.init(appId, appsflyerDevKey, (err) => {
      if (err) {
        if (global.__DEV__) console.log('AppsFlyer Failed to initialize: ', err)
      } else {
        if (global.__DEV__) console.log('AppsFlyer Initialized! ')
      }
    });
  };

  identify = (userId, traits = {}, options = {}) => {
    if(!rnSegment) {
      return;
    }

    rnSegment.identify(userId, traits, options);
  };

  track = (event, properties = {}, options = {}) => {
    if(!rnSegment) {
      return;
    }

    rnSegment.track(event, properties, options);
    af.trackEvent(event, properties, (err, uid) => {
      if (err) {
        if (global.__DEV__) console.log('AppsFlyer Failed to track: ', err)
      }
    });
  };

  screen = (event, properties = {}, options = {}) => {
    if(!rnSegment) {
      return;
    }

    rnSegment.screen(event, properties, options);
  };

  alias = (newid, options = {}) => {
    if(!rnSegment) {
      return;
    }

    rnSegment.alias(newId, options);
  };

  reset = () => {
    if(!rnSegment) {
      return;
    }

    rnSegment.reset();
  };
}

export default new Segment();
