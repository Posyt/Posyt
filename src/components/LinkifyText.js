import React from 'react';
import { Text } from 'react-native';
import LinkifyIt from 'linkify-it';
import _ from 'lodash';
import {
  gold,
} from '../lib/constants';
import { shadeColor } from '../lib/utils';
import openURL from '../lib/openURL';

const linkify = new LinkifyIt();

class LinkifyText extends React.Component {
  highlightText(text) {
    const { highlight } = this.props;
    if (!highlight || highlight === '') return [text];
    const highlightColor = shadeColor(0.6, gold);
    const regex = new RegExp(`(${_.escapeRegExp(highlight)})`, 'gim');
    const tokens = text.split(regex);
    const result = [];
    tokens.forEach((t, i) => {
      if (t.search(regex) !== -1) {
        result.push(
          <Text key={`${i}_${i}`} style={{ backgroundColor: highlightColor }}>
            {t}
          </Text>
        );
      } else {
        result.push(t);
      }
    });
    return result;
  }

  onOpenURL(url) {
    if (this.props.onOpenURL) this.props.onOpenURL();
    openURL(url, this.props.onCloseURL);
  }

  render() {
    const text = this.props.children || '';
    const links = linkify.match(text);
    let result = [];

    if (!links) {
      result = result.concat(this.highlightText(text.toString()));
    } else {
      let lastIndex = 0;
      // TODO: make sure link underlining works on Android
      links.forEach((link, i) => {
        if (link.index > lastIndex) {
          result.push(this.highlightText(text.substring(lastIndex, link.index)));
        }
        result.push(
          <Text key={i} onPress={() => this.onOpenURL(link.url)} style={{ textDecorationLine: 'underline' }}>
            {this.highlightText(link.text)}
          </Text>
        );
        lastIndex = link.lastIndex;
      });
      if (lastIndex < text.length) {
        result.push(this.highlightText(text.substring(lastIndex)));
      }
    }

    return (
      <Text style={this.props.style}>
        {result}
      </Text>
    );
  }
}

LinkifyText.propTypes = {
  children: React.PropTypes.string.isRequired, // TODO: allow nested text components
  style: React.PropTypes.any,
  highlight: React.PropTypes.string,
  onOpenURL: React.PropTypes.func,
  onCloseURL: React.PropTypes.func,
};

module.exports = LinkifyText;
