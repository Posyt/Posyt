import React from 'react';
import { StyleSheet, View } from 'react-native';
import ScrollableTabView from '../components/ScrollableTabView';
import PosytTabBar from '../components/PosytTabBar';
import ConnectScreen from '../components/ConnectScreen';
import ConversationsScreen from '../components/ConversationsScreen';
import {
  lightGrey,
} from '../lib/constants';
import segment from '../lib/segment';

const styles = StyleSheet.create({
  corners: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: lightGrey,
    borderRadius: 6,
  },
});

class Tabs extends React.Component {
  constructor(props) {
    super(props);
    this.tab = null;
  }

  componentDidMount() {
    segment.screen('Viewed Cards');
    this.tab = 0;
  }

  onChangeTab({ i }) {
    if (this.tab !== i) {
      const tabs = { 0: 'Viewed Cards', 1: 'Viewed Conversations' };
      segment.screen(tabs[i]);
      this.tab = i;
    }
  }

  render() {
    return (
      <View style={styles.corners}>
        <View style={styles.container}>
          <ScrollableTabView
            renderTabBar={() => <PosytTabBar />}
            onChangeTab={(tab) => this.onChangeTab(tab)}
          >
            <ConnectScreen tabLabel="documents" />
            <ConversationsScreen tabLabel="chat" />
          </ScrollableTabView>
        </View>
      </View>
    );
  }
}

export default Tabs;
