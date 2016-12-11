import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import Lightbox from 'react-native-lightbox';
import LinearGradient from 'react-native-linear-gradient';
import FLAnimatedImage from 'react-native-flanimatedimage';
import {
  topCardExpanded,
  topCardContracted,
} from '../lib/actions';
import openURL from '../lib/openURL';
import {
  articleTitle,
  articleDescription,
  articleURL,
  articleSources,
} from '../lib/articleHelpers';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrap: {
    flex: 2,
    backgroundColor: 'black',
  },
  lightbox: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  text: {
    position: 'relative',
    flex: 3,
    paddingTop: 20,
  },
  title: {
    fontFamily: 'Rooney Sans',
    fontWeight: '500',
    fontSize: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: 100,
  },
  sources: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    textAlign: 'right',
    fontFamily: 'Rooney Sans',
    fontWeight: '400',
    fontSize: 16,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
});

// TODO: make sure the image does not block dragging of it's parent card
// TODO: get pinch to zoom working in lightbox, see dev branches in lightbox repo
class ArticleImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  onLayout = (e) => {
    this.setState({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  }

  onGifLoadEnd = (e) => {
    this.setState({ loading: false });
    // if (!e.nativeEvent.size) return;
    // const { width, height } = e.nativeEvent.size;
    // this.setState({
    //   width,
    //   height,
    // });
  }

  render() {
    const { width, height, open, loading } = this.state;
    const { article } = this.props;
    if (!article.image_url) return null;
    const uri = article.image_url.replace('http://', 'https://'); // NOTE: ios needs SSL images
    return (
      <View style={styles.imageWrap} onLayout={this.onLayout}>
        {uri.includes('.gif') ? (
          <View>
            {loading && (
              <ActivityIndicator
                animating={loading}
                style={[{ height, alignItems: 'center', justifyContent: 'center' }]}
                size="large"
              />
            )}
            <FLAnimatedImage
              // resizeMode="cover"
              source={{ uri }}
              style={[styles.image, !open && { width, height }]}
              onLoadEnd={this.onGifLoadEnd}
            />
          </View>
        ) : (
          <Lightbox
            style={styles.lightbox}
            activeProps={{ resizeMode: 'contain' }}
            onOpen={() => this.setState({ open: true })}
            onClose={() => this.setState({ open: false })}
          >
            <Image
              resizeMode="cover"
              source={{ uri }}
              style={[styles.image, !open && { width, height }]}
            />
          </Lightbox>
        )}
      </View>
    );
  }
}
ArticleImage.propTypes = {
  article: React.PropTypes.object.isRequired,
};

function titleComp(article) {
  const title = articleTitle(article);
  return title && <Text style={styles.title}>{title}</Text>;
}

function descriptionComp(article) {
  const description = articleDescription(article);
  return description && <Text style={styles.description}>{description}</Text>;
}

function sourcesComp(article, dispatch) {
  const sources = articleSources(article);
  return !!sources.length && (
    <LinearGradient style={styles.bottom}
      colors={['rgba(255,255,255,0)', 'white']}
    >
      <Text style={styles.sources}>
        {sources.map((s, i) => (
          <Text key={s.name}>
            {i !== 0 && <Text> | </Text>}
            <Text onPress={() => {
              openURL(s.url, () => dispatch(topCardContracted()));
              dispatch(topCardExpanded());
            }}>{s.name}</Text>
          </Text>
        ))}
      </Text>
    </LinearGradient>
  );
}

class CardArticle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onPress.bind(this);
  }

  onPress() {
    openURL(articleURL(this.props.article), this.onDismissWebView.bind(this));
    this.props.dispatch(topCardExpanded());
  }

  onDismissWebView() {
    this.props.dispatch(topCardContracted());
  }

  render() {
    const { article, dispatch } = this.props;

    return (
      <View style={styles.container}>
        <ArticleImage article={article} />
        <View style={styles.text}>
          {titleComp(article)}
          {descriptionComp(article)}
          {sourcesComp(article, dispatch)}
        </View>
      </View>
    );
  }
}
CardArticle.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  article: React.PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })(CardArticle);
