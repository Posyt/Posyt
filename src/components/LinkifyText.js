import React from 'react';
import { Text } from 'react-native';
import { tokenize } from 'linkifyjs'; // NOTE: TODO: consider replacing with https://github.com/gregjacobs/Autolinker.js if you need to link phone numbers and other things too
import _ from 'lodash';
import {
  gold,
} from '../lib/constants';
import { shadeColor } from '../lib/utils';
import openURL from '../lib/openURL';

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
    const tokens = tokenize(this.props.children || '');
    let result = [];
    // TODO: make sure link underlining works on Android
    tokens.forEach((t, i) => {
      if (t.isLink) {
        result.push(
          <Text key={i} onPress={() => this.onOpenURL(t.toHref('http'))} style={{ textDecorationLine: 'underline' }}>
            {this.highlightText(t.toString())}
          </Text>
        );
      } else {
        result = result.concat(this.highlightText(t.toString()));
      }
    });

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
