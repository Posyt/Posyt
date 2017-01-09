import React, { Component } from 'react';
import { View, StatusBar } from 'react-native';
import {
  Scene,
  Router,
} from 'react-native-router-flux';
import Orientation from 'react-native-orientation';
import Tabs from './Tabs';
import ChatScreen from '../components/ChatScreen';
import NoNetworkBar from '../components/NoNetworkBar';
import NoServerBar from '../components/NoServerBar';
import PushNotificationBar from '../components/PushNotificationBar';

class App extends Component {
  componentWillMount() {
    Orientation.lockToPortrait();
  }

  render() {
    return (
      <View style={{ backgroundColor: 'black', flex: 1 }}>
        <StatusBar hidden={false} barStyle="default" />
        <Router>
          <Scene key="root" hideNavBar>
            <Scene key="tabs" component={Tabs} initial hideNavBar />
            <Scene key="chat" component={ChatScreen} hideNavBar />
          </Scene>
        </Router>
        <NoServerBar />
        <NoNetworkBar />
        <PushNotificationBar />
      </View>
    );
  }
}

export default App;
