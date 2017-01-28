import React from 'react';
import { StyleSheet, View, SegmentedControlIOS } from 'react-native';
import { connect } from 'react-redux';
import {
  black,
} from '../lib/constants';

const styles = StyleSheet.create({
  container: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5,
  },
});

class CardsFilter extends React.Component {
  render() {
    const { currentUser } = this.props;
    return (
      <View style={styles.container}>
        <SegmentedControlIOS
          tintColor={black}
          values={['New', 'Hot', 'Popular']}
          selectedIndex={1}
        />
      </View>
    );
  }
}


CardsFilter.propTypes = {
  currentUser: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

export default connect(mapStateToProps)(CardsFilter);
