import auth from './authReducer';
import device from './deviceReducer';
import tabBar from './tabBarReducer';
import cards from './cardsReducer';
import conversations from './conversationsReducer';
import chat from './chatReducer';
import deepLink from './deepLinkReducer';

import { combineReducers } from 'redux';

/**
 * ## CombineReducers
 *
 * the rootReducer will call each and every reducer with the state and action
 * EVERY TIME there is a basic action
 */
const rootReducer = combineReducers({
  auth,
  device,
  tabBar,
  cards,
  conversations,
  chat,
  deepLink,
});

export default rootReducer;
