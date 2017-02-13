import './lib/ReactotronConfig'; // NOTE this makes sure Reactotron is initialized first
import React from 'react';
import {
  AsyncStorage,
  AppRegistry,
} from 'react-native';
import { ApolloProvider } from 'react-apollo';
import codePush from 'react-native-code-push';
import crashlytics from 'react-native-fabric-crashlytics';
import DeviceInfo from 'react-native-device-info';
import App from './containers/App';
import {
  segmentWriteKey,
  sentryPublicDSN,
} from './lib/constants';
import './lib/bugsnag';
import { store } from './lib/store';
import { apolloClient } from './lib/apolloClient';
import { setPlatform } from './lib/actions';
import segment from './lib/segment';

import Raven from 'raven-js';
require('raven-js/plugins/react-native')(Raven);
Raven.config(sentryPublicDSN, { release: DeviceInfo.getVersion() }).install();
crashlytics.init();

export default function posyt(platform) {
  class Posyt extends React.Component {
    constructor(props) {
      super(props);
      store.dispatch(setPlatform(platform));
      const debug = false; // global.__DEV__;
      segment.setupWithConfiguration(segmentWriteKey, debug);
    }

    componentDidMount() {
      AsyncStorage.getItem('loginToken').then(token => {
        global.authToken = token;
        apolloClient.resetStore();
      });
    }

    render() {
      return (
        <ApolloProvider store={store} client={apolloClient}>
          <App />
        </ApolloProvider>
      );
    }
  }

  const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
    installMode: codePush.InstallMode.ON_NEXT_RESUME,
  };
  AppRegistry.registerComponent('Posyt', () => codePush(codePushOptions)(Posyt));
}
