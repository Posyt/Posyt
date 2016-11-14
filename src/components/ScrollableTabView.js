// https://github.com/brentvatne/react-native-scrollable-tab-view/blob/master/index.js

import React, {
  PropTypes,
} from 'react';
import {
  Dimensions,
  View,
  Animated,
  ScrollView,
  Platform,
  StyleSheet,
  ViewPagerAndroid,
  InteractionManager,
} from 'react-native';
import { connect } from 'react-redux';
import PosytTabBar from './PosytTabBar';

const TimerMixin = require('react-timer-mixin');

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const ScrollableTabView = React.createClass({
  mixins: [TimerMixin],

  statics: {
    PosytTabBar,
  },

  propTypes: {
    tabBarPosition: PropTypes.oneOf(['top', 'bottom']),
    initialPage: PropTypes.number,
    onChangeTab: PropTypes.func,
    renderTabBar: PropTypes.any,
    style: View.propTypes.style,
  },

  getDefaultProps() {
    return {
      tabBarPosition: 'top',
      initialPage: 0,
      onChangeTab: () => {},
    }
  },

  getInitialState() {
    return {
      currentPage: this.props.initialPage,
      scrollValue: new Animated.Value(this.props.initialPage),
      container: {
        width: deviceWidth,
        height: deviceHeight,
      }
    };
  },

  componentWillReceiveProps(props) {
    if (props.initialPage && props.initialPage !== this.state.currentPage) {
      this.goToPage(props.initialPage);
    }
    if (props.locked !== this.props.locked || props.visible !== this.props.visible) {
      if (props.locked || !props.visible) {
        this.goToPage(this.state.currentPage)
      }
    }
  },

  goToPage(pageNumber) {
    this.props.onChangeTab({ i: pageNumber, ref: this._children()[pageNumber] });

    if(Platform.OS === 'ios') {
      var offset = pageNumber * this.state.container.width;
      this.scrollView.scrollTo({ x: offset, y: 0, animated: true });
    } else {
      this.scrollView.setPage(pageNumber);
    }

    this.setState({currentPage: pageNumber});
  },

  renderTabBar(props) {
    if (this.props.renderTabBar === false) {
      return null;
    } else if (this.props.renderTabBar) {
      return React.cloneElement(this.props.renderTabBar(), props);
    } else {
      return <PosytTabBar {...props} />;
    }
  },

  renderScrollableContent() {
    if (Platform.OS === 'ios') {
      return (
        <ScrollView
          horizontal
          pagingEnabled
          automaticallyAdjustContentInsets={false}
          contentOffset={{x:this.props.initialPage * this.state.container.width}}
          ref={(scrollView) => { this.scrollView = scrollView }}
          onScroll={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            this._updateScrollValue(offsetX / this.state.container.width);
          }}
          onMomentumScrollBegin={this._onMomentumScrollBeginAndEnd}
          onMomentumScrollEnd={this._onMomentumScrollBeginAndEnd}
          scrollEventThrottle={16}
          scrollsToTop={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!this.props.locked && this.props.visible && !this.props.locked}
          directionalLockEnabled
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps
          style={[styles.scrollableContentIOS, this.props.removeTopMargin && { marginTop: 0 } ]}
          contentContainerStyle={styles.scrollableContentContainerIOS}
        >
          {this._children().map((child,idx) => {
            return <View
              key={child.props.tabLabel + '_' + idx}
              style={{width: this.state.container.width}}>
              {child}
            </View>
            })}
        </ScrollView>
      );
    } else {
      return (
        <ViewPagerAndroid
         style={styles.scrollableContentAndroid}
         initialPage={this.props.initialPage}
         onPageSelected={this._updateSelectedPage}
         onPageScroll={(e) => {
           const {offset, position} = e.nativeEvent;
           this._updateScrollValue(position + offset);
         }}
         ref={(scrollView) => { this.scrollView = scrollView }}>
         {this._children().map((child,idx) => {
           return <View
             key={child.props.tabLabel + '_' + idx}
             style={{width: this.state.container.width}}>
             {child}
           </View>
         })}
        </ViewPagerAndroid>
      );
    }
  },

  _onMomentumScrollBeginAndEnd(e) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / this.state.container.width);
    if (this.state.currentPage !== page) {
      this._updateSelectedPage(page);
    }
  },

  _updateSelectedPage(currentPage) {
    if (typeof currentPage === 'object') {
      currentPage = currentPage.nativeEvent.position;
    }
    this.setState({currentPage}, () => {
      this.props.onChangeTab({ i: currentPage });
    });
  },

  _updateScrollValue(value) {
    this.state.scrollValue.setValue(value);
  },

  _handleLayout(e) {
    var {width, height} = e.nativeEvent.layout;
    var container = this.state.container;

    if (width !== container.width || height !== container.height) {
      this.setState({container: e.nativeEvent.layout});
      InteractionManager.runAfterInteractions(() => {
        this.goToPage(this.state.currentPage);
      });
    }
  },

  _children() {
    return React.Children.map(this.props.children, (child) => child);
  },

  render() {
    const tabBarProps = {
      goToPage: this.goToPage,
      tabs: this._children().map((child) => child.props.tabLabel),
      activeTab: this.state.currentPage,
      scrollValue: this.state.scrollValue,
      underlineColor : this.props.tabBarUnderlineColor,
      backgroundColor : this.props.tabBarBackgroundColor,
      activeTextColor : this.props.tabBarActiveTextColor,
      inactiveTextColor : this.props.tabBarInactiveTextColor,
      containerWidth: this.state.container.width,
    };

    return (
      <View style={[styles.container, this.props.style]} onLayout={this._handleLayout}>
        {this.props.tabBarPosition === 'top' ? this.renderTabBar(tabBarProps) : null}
        {this.renderScrollableContent()}
        {this.props.tabBarPosition === 'bottom' ? this.renderTabBar(tabBarProps) : null}
      </View>
    );
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollableContentContainerIOS: {
    // flex: 1,
  },
  scrollableContentIOS: {
    marginTop: 65,
    backgroundColor: 'transparent',
    overflow: 'visible',
    // flexDirection: 'column',
  },
  scrollableContentAndroid: {
    flex: 1,
  },
});

function mapStateToProps(state) {
  return {
    visible: state.tabBar.visible,
    locked: state.tabBar.locked,
    removeTopMargin: state.tabBar.removeTopMargin,
  };
}

export default connect(mapStateToProps)(ScrollableTabView);
