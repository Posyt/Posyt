import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

const styles = StyleSheet.create({
  container: {
  },
});

class Template extends React.Component {
  render() {
    const { currentUser } = this.props;
    return (
      <View style={styles.container}>
      </View>
    );
  }
}


Template.propTypes = {
  currentUser: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

export default connect(mapStateToProps)(Template);
