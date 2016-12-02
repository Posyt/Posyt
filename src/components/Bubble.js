import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  PixelRatio,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Alert,
} from 'react-native';
import _ from 'lodash';
import Lightbox from 'react-native-lightbox';
import Shimmer from 'react-native-shimmer';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  red,
  blue,
  grey,
} from '../lib/constants';
import {
  sendMessage,
} from '../lib/actions';
import openURL from '../lib/openURL';
import LinkifyText from './LinkifyText';

const styles = StyleSheet.create({
  bubbleWrap: {
    position: 'relative',
    flex: 1,
    marginTop: 10,
    marginHorizontal: 5,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  date: {
    marginTop: 15,
    flex: 1,
    flexDirection: 'row',
    // fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 12,
    color: grey,
    textAlign: 'center',
  },
  bubble: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: grey,
  },

  state: {
    fontSize: 11,
    fontWeight: '600',
  },
  messageFailedDot: {
    position: 'absolute',
    top: 5,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: red,
  },
  messageFailedDash: {
    width: 12,
    height: 3,
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 14,
    paddingBottom: 2,
    marginBottom: -2,
  },

  bouncingDots: {
    height: 15,
    width: 30,
    opacity: 0.5,
  },

  posytText: {
    fontFamily: 'Rooney Sans',
    fontWeight: '500',
    fontSize: 17,
    marginBottom: -5,
  },
});


function MessageBubble({ message }) {
  // if (message.isTypingIndicator) return <Image style={styles.bouncingDots} source={require('../../assets/images/bouncing_dots.gif')} />;
  if (message.isTypingIndicator) return (
    <View style={[styles.messageText,
      message.isMine && { color: 'white' },
    ]}>
      <Shimmer pauseDuration={200} speed={23} animationOpacity={0.4}>
        <Text style={{ fontWeight: '500', fontSize: 10, lineHeight: 17, opacity: 0.8, letterSpacing: 5, marginLeft: -5 }}>●●●</Text>
      </Shimmer>
    </View>
  );
  return (
    <LinkifyText style={[styles.messageText,
      message.isMine && { color: 'white' },
    ]}>
      {message.content}
    </LinkifyText>
  );
}
function MessageFailedDot({ message, dispatch }) {
  // TODO: get this to show up
  return (
    <TouchableHighlight style={styles.messageFailedDot} onPress={() => {
      Alert.alert('Message failed to send', null, [
        { text: 'Retry', onPress: () => dispatch(sendMessage(message, { retry: true })) },
        { text: 'Delete', onPress: () => dispatch(sendMessage(message, { delete: true })) },
        { text: 'OK', style: 'cancel' },
      ]);
    }}>
      <View style={styles.messageFailedDash} />
    </TouchableHighlight>
  );
}


function PosytBubble({ posyt }) {
  return (
    <LinkifyText style={[styles.posytText,
      !posyt.isParticipants && { textAlign: 'center' },
    ]}>
      {posyt.content}
    </LinkifyText>
  );
}


const articleStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrap: {
    flex: 1,
    height: 100,
  },
  lightbox: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  text: {
    position: 'relative',
    flex: 2,
    paddingTop: 10,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Rooney Sans',
    fontWeight: '500',
    fontSize: 20,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  sources: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    textAlign: 'right',
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 16,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    backgroundColor: 'transparent',
  },
});

// TODO: make sure the image does not block dragging of it's parent card
// TODO: get pinch to zoom working in lightbox, see dev branches in lightbox repo
class ArticleImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onLayout(e) {
    this.setState({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  }

  render() {
    const { width, height, open } = this.state;
    const { article } = this.props;
    if (!article.image_url) return null;
    // TODO: wait for this issue to be resolved before allowing gifs https://github.com/facebook/react-native/issues/1968
    if (article.image_url.includes('.gif')) return null;
    return (
      <View style={articleStyles.imageWrap} onLayout={this.onLayout.bind(this)}>
        <Lightbox style={articleStyles.lightbox}
          activeProps={{ resizeMode: 'contain' }}
          onOpen={() => this.setState({ open: true })}
          onClose={() => this.setState({ open: false })}
        >
          <Image resizeMode="cover"
            source={{ uri: article.image_url }}
            style={[articleStyles.image, !open && { width, height }]}
          />
        </Lightbox>
      </View>
    );
  }
}
ArticleImage.propTypes = {
  article: React.PropTypes.object.isRequired,
};

function titleComp(article) {
  let title = article.title;
  if (!title) title = article.sources && _.compact(article.sources.map(s => s.title))[0];
  return title && <Text style={articleStyles.title}>{title}</Text>;
}

function descriptionComp(article) {
  let description = article.description;
  if (!description) description = article.sources && _.compact(article.sources.map(s => s.description))[0];
  return description && <Text style={articleStyles.description}>{description}</Text>;
}

function getURL(article) {
  return article.url || article.sources && _.compact(article.sources.map(s => s.url))[0];
}

function sourcesComp(article) {
  const sourceNames = [article.source, ...(article.sources && article.sources.map(s => s.name))];
  const sources = _.compact(sourceNames).join(' | ');
  return !!sources.length && (
    <Text style={articleStyles.sources}>{sources}</Text>
  );
}

function ArticleBubble({ article }) {
  return (
    <View style={articleStyles.container}>
      <ArticleImage article={article} />
      <TouchableWithoutFeedback onPress={() => openURL(getURL(article))}>
        <View style={articleStyles.text}>
          {titleComp(article)}
          {descriptionComp(article)}
          {sourcesComp(article)}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}


function BubbleDate({ data }) {
  const date = moment(data.date);
  const split = date.calendar(null, { sameElse: 'D/M/YYYY' }).split(' at ');
  const day = <Text style={{ fontWeight: '500' }}>{split[0]}</Text>;
  const time = date.format('h:mm A');
  return (
    <Text style={styles.date}>
      {day} {time}
    </Text>
  );
}


class Bubble extends React.Component {
  renderBubbleType() {
    const { data } = this.props;
    if (data._type === 'message') return <MessageBubble message={data} />;
    if (data._type === 'article') return <ArticleBubble article={data} />;
    if (data._type === 'posyt') return <PosytBubble posyt={data} />;
    return null;
  }

  render() {
    const { data, dispatch } = this.props;
    const showDate = !data.previousDate || moment(data.date).subtract(30, 'minutes').isAfter(moment(data.previousDate));
    // TODO: DEBUG: willShowNextDate is not always accurate. sometimes it's true when the next bubble does not show a date
    const willShowNextDate = data.nextDate && moment(data.nextDate).subtract(30, 'minutes').isAfter(moment(data.date));
    return (
      <View>
        {showDate && <BubbleDate data={data} />}
        <View style={[styles.bubbleWrap,
          data.isMine && { marginLeft: 40, alignItems: 'flex-end' },
          !data.isMine && { marginRight: 40 },
          !data.isParticipants && { marginLeft: 40 },
          data.isMine && data.previousIsSameOwner && { marginTop: 1 },
          data.isParticipants && !data.isMine && data.previousIsSameOwner && { marginTop: 1 },
          !data.isParticipants && !data.previousIsParticipants && { marginTop: 20 },
          showDate && { marginTop: 3 },
        ]}>
          <View style={[styles.bubble,
            !data.isParticipants && { alignSelf: 'stretch' },
            data.isMine && { backgroundColor: blue },
            ['article', 'posyt'].includes(data._type) && { backgroundColor: 'white', borderColor: grey, borderWidth: 1 / PixelRatio.get() },
            data._type === 'article' && { padding: 0 },
            !showDate && data.isMine && data.previousIsSameOwner && { borderTopRightRadius: 4 },
            !willShowNextDate && data.isMine && data.nextIsSameOwner && { borderBottomRightRadius: 4 },
            !showDate && data.isParticipants && !data.isMine && data.previousIsSameOwner && { borderTopLeftRadius: 4 },
            !willShowNextDate && data.isParticipants && !data.isMine && data.nextIsSameOwner && { borderBottomLeftRadius: 4 },
            !showDate && !data.isParticipants && !data.previousIsParticipants && !data.isFirst && { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
            !willShowNextDate && !data.isParticipants && !data.nextIsParticipants && !data.isLast && { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
            data.state === 'failed' && data._type === 'message' && { marginRight: 24 },
          ]}>
            {this.renderBubbleType()}
          </View>
          {data.state === 'sending' && data._type === 'message' && <Text style={[styles.state, { color: grey }]}>Sending...</Text>}
          {data.state === 'failed' && data._type === 'message' && <MessageFailedDot message={data} dispatch={dispatch} />}
          {data.isLastDelivered && !data.isLastRead && <Text style={[styles.state, { color: grey }]}>Delivered</Text>}
          {data.isLastRead && <Text style={[styles.state, { color: grey }]}>Read</Text>}
        </View>
      </View>
    );
  }
}
Bubble.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  data: React.PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps)(Bubble)
