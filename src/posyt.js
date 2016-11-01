import './lib/ReactotronConfig'; // NOTE this makes sure Reactotron is initialized first
import React from 'react';
import {
  AppRegistry,
} from 'react-native';
import { Provider } from 'react-redux';
import App from './containers/App';
// import {
//   segmentWriteKey,
// } from './lib/constants';
import { store } from './lib/store';
import { setPlatform } from './lib/actions';
// import segment from 'react-native-segment';
// import codePush from "react-native-code-push";

export default function posyt(platform) {
  class Posyt extends React.Component {
    constructor(props) {
      super(props);
      store.dispatch(setPlatform(platform));
      const debug = false; // global.__DEV__;
      // segment.setupWithConfiguration(segmentWriteKey, debug);
    }

    componentDidMount() {
      // codePush.sync();
    }

    render() {
      return (
        <Provider store={store}>
          <App />
        </Provider>
      );
    }
  }

  AppRegistry.registerComponent('Posyt', () => Posyt);
}
