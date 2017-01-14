import './lib/ReactotronConfig'; // NOTE this makes sure Reactotron is initialized first
import React from 'react';
import {
  AppRegistry,
} from 'react-native';
import { Provider } from 'react-redux';
import codePush from 'react-native-code-push';
import App from './containers/App';
import {
  segmentWriteKey,
  sentryPublicDSN,
} from './lib/constants';
import { store } from './lib/store';
import { setPlatform } from './lib/actions';
import segment from './lib/segment';
import DeviceInfo from 'react-native-device-info';

import Raven from 'raven-js';
require('raven-js/plugins/react-native')(Raven);
Raven.config(sentryPublicDSN, { release: DeviceInfo.getVersion() }).install();

export default function posyt(platform) {
  class Posyt extends React.Component {
    constructor(props) {
      super(props);
      store.dispatch(setPlatform(platform));
      const debug = false; // global.__DEV__;
      segment.setupWithConfiguration(segmentWriteKey, debug);
    }

    render() {
      return (
        <Provider store={store}>
          <App />
        </Provider>
      );
    }
  }

  AppRegistry.registerComponent('Posyt', () => codePush(Posyt));
}
