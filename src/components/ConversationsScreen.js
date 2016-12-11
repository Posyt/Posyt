import React from 'react';
import {StyleSheet, View, Text, ListView, PixelRatio, TouchableHighlight} from 'react-native';
import {
  pageConversations,
  showConversation,
} from '../lib/actions';
import {
  lightGrey,
  lightBlack,
  green,
} from '../lib/constants';
import { connect } from 'react-redux';
import { ddp } from '../lib/DDP';
import DateOldText from './DateOldText';
import _ from 'lodash';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 4,
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderWidth: 1 / PixelRatio.get(),
    // borderBottomWidth: 2 / PixelRatio.get(),
    borderColor: '#ddd',
    overflow: 'hidden',
  },

  cell: {
    borderBottomWidth: 2 / PixelRatio.get(),
    borderColor: lightGrey,
  },
  cellInner: {
    marginHorizontal: 10,
    marginTop: 16,
    marginBottom: 14,
  },
  row1: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  username: {
    flex: 1,
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 20,
  },
  date: {
    flex: 0,
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 14,
    color: lightBlack,
  },
  onlineDot: {
    overflow: 'hidden',
    borderRadius: 3,
    width: 6,
    height: 6,
    backgroundColor: green,
    marginTop: 4,
    marginRight: 8,
  },
  row2: {
    flexDirection: 'row',
  },
  content: {
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 16,
    color: lightBlack,
    overflow: 'hidden',
    height: 20,
  },
});

class ConversationsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  subscribe(limit) {
    ddp.subscribe('Conversations', [limit]).then((id) => { this.subId = id });
  }

  componentWillMount() {
    this.subscribe(this.props.limit);
  }

  componentWillUnmount() {
    ddp.unsubscribe(this.subId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.limit !== nextProps.limit || this.props.loggedIn !== nextProps.loggedIn) {
      ddp.unsubscribe(this.subId, { keepData: true });
      this.subscribe(nextProps.limit);
    }
  }

  renderRow(conversation) {
    const { dispatch } = this.props;
    if (!conversation || !conversation.user || !conversation.user.username || !conversation.participants) return null;
    const date = conversation.lastMessage && conversation.lastMessage.createdAt || conversation.createdAt;
    const participantMe = _.find(conversation.participants, { id: ddp.userId });
    const isUnread = participantMe && !participantMe.isCurrent;
    const isOnline = _.get(conversation, 'user.status.online');
    return (
      <TouchableHighlight style={styles.cell} underlayColor={lightGrey} key={conversation._id} onPress={ () => dispatch(showConversation(conversation._id)) }>
        <View style={styles.cellInner}>
          <View style={styles.row1}>
            <Text style={[styles.username, isUnread && { fontWeight: '600' }]}>
              {conversation.user.username}
            </Text>
            {!!isOnline && <View style={styles.onlineDot} />}
            <DateOldText date={date} shorten={true} uppercase={false} ending='' style={styles.date} />
          </View>
          <View style={styles.row2}>
            <Text style={styles.content}>
              {conversation.lastMessage ? conversation.lastMessage.content : 'Start the conversation...'}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const { dataSource } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ListView
            style={styles.listView}
            dataSource={dataSource}
            renderRow={this.renderRow.bind(this)}
            onEndReached={() => this.props.dispatch(pageConversations())}
            onEndReachedThreshold={200}
            enableEmptySections={true}
          />
        </View>
      </View>
    );
  }
}

ConversationsScreen.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  loggedIn: React.PropTypes.bool.isRequired,
  limit: React.PropTypes.number.isRequired,
  dataSource: React.PropTypes.instanceOf(ListView.DataSource).isRequired,
};

function mapStateToProps(state) {
  const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
  return {
    loggedIn: state.auth.loggedIn,
    limit: state.conversations.limit,
    dataSource: ds.cloneWithRows(state.conversations.conversations),
  };
}

export default connect(mapStateToProps)(ConversationsScreen)
