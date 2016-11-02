import React from 'react';
import { Text } from 'react-native';
import moment from 'moment';

function setDefaultRelativeTime() {
  moment.updateLocale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: 'seconds',
      m: 'a minute',
      mm: '%d minutes',
      h: 'an hour',
      hh: '%d hours',
      d: 'a day',
      dd: '%d days',
      M: 'a month',
      MM: '%d months',
      y: 'a year',
      yy: '%d years',
    },
  });
}

function setAbbreviatedRelativeTime() {
  moment.updateLocale('en', {
    relativeTime: {
      future: '%s',
      past: '%s',
      s: 'now',
      m: '1m',
      mm: '%dm',
      h: '1h',
      hh: '%dh',
      d: '1d',
      dd: '%dd',
      M: '1m',
      MM: '%dm',
      y: '1y',
      yy: '%dy',
    },
  });
}

class DateOldText extends React.Component {
  render() {
    if (this.props.shorten) {
      setAbbreviatedRelativeTime();
    } else {
      setDefaultRelativeTime();
    }
    let dateOld = moment(this.props.date).fromNow();
    dateOld = dateOld.replace('ago', (this.props.ending === undefined ? 'old' : this.props.ending));
    if (this.props.uppercase) dateOld = dateOld.toUpperCase();

    return (
      <Text style={this.props.style}>
        {dateOld.trim()}
      </Text>
    );
  }
}

DateOldText.propTypes = {
  date: React.PropTypes.instanceOf(Date),
  shorten: React.PropTypes.bool,
  uppercase: React.PropTypes.bool,
  ending: React.PropTypes.string,
  style: Text.propTypes.style,
};

export default DateOldText;
