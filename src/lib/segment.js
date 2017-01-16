import appsFlyer from 'react-native-appsflyer';
import { Answers, Crashlytics } from 'react-native-fabric';
import { AppEventsLogger } from 'react-native-fbsdk';
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

    this._debug = debug;
    rnSegment.setupWithConfiguration(writeKey, debug);
    appsFlyer.initSdk({ appId, devKey: appsflyerDevKey, isDebug: debug }, (success) => {
      if (global.__DEV__) console.log('AppsFlyer Initialized!');
    }, (err) => {
      if (global.__DEV__) console.log('AppsFlyer Failed to initialize: ', err);
    });
  };

  identify = (userId, traits = {}, options = {}) => {
    if(!rnSegment) {
      return;
    }

    rnSegment.identify(userId, traits, options);
    appsFlyer.setCustomerUserId(userId, (success) => {
      if (global.__DEV__ && this._debug) console.log('AppsFlyer setCustomerUserId success: ', userId);
    });
    Crashlytics.setUserIdentifier(userId);
    if (traits.username) Crashlytics.setUserName(traits.username);
  };

  track = (event, properties = {}, options = {}) => {
    if(!rnSegment) {
      return;
    }

    rnSegment.track(event, properties, options);
    appsFlyer.trackEvent(event, properties, (success) => {
      if (global.__DEV__ && this._debug) console.log('AppsFlyer Track success: ', event);
    }, (err) => {
      if (global.__DEV__) console.log('AppsFlyer Failed to track: ', err);
    });
    Answers.logCustom(event, properties);
    AppEventsLogger.logEvent(event, properties);
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
