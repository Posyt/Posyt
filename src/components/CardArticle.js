import React from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import {
  topCardExpanded,
  topCardContracted,
} from '../lib/actions.js';
import _ from 'lodash';
import Lightbox from 'react-native-lightbox';
import openURL from '../lib/openURL';
import {
  articleTitle,
  articleDescription,
  articleURL,
  articleSources,
} from '../lib/articleHelpers';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrap: {
    flex: 1,
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
    //   A stopgap could be only rendering gifs that are less than 10mb
    if (article.image_url.includes('.gif')) return null;
    return (
      <View style={styles.imageWrap} onLayout={this.onLayout.bind(this)}>
        <Lightbox style={styles.lightbox}
          activeProps={{ resizeMode: 'contain' }}
          onOpen={() => this.setState({ open: true })}
          onClose={() => this.setState({ open: false })}
        >
          <Image resizeMode="cover"
            source={{ uri: article.image_url }}
            style={[styles.image, !open && { width, height }]}
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
  const title = articleTitle(article);
  return title && <Text style={styles.title}>{title}</Text>;
}

function descriptionComp(article) {
  const description = articleDescription(article);
  return description && <Text style={styles.description}>{description}</Text>;
}

function sourcesComp(article) {
  const sources = articleSources(article);
  return !!sources.length && (
    <LinearGradient style={styles.bottom}
      colors={['rgba(255,255,255,0)', 'white']}
    >
      <Text style={styles.sources}>{sources}</Text>
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
    const { article } = this.props;

    return (
      <View style={styles.container}>
        <ArticleImage article={article} />
        <View style={styles.text}>
          {titleComp(article)}
          {descriptionComp(article)}
          {sourcesComp(article)}
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
