import ddp from './ddpReducer';
import auth from './authReducer';
import device from './deviceReducer';
import tabBar from './tabBarReducer';
import cards from './cardsReducer';
import conversations from './conversationsReducer';
import chat from './chatReducer';
import deepLink from './deepLinkReducer';
import { apolloClient } from '../lib/apolloClient';

import { combineReducers } from 'redux';

/**
 * ## CombineReducers
 *
 * the rootReducer will call each and every reducer with the state and action
 * EVERY TIME there is a basic action
 */
const rootReducer = combineReducers({
  ddp,
  auth,
  device,
  tabBar,
  cards,
  conversations,
  chat,
  deepLink,
  apollo: apolloClient.reducer(),
});

export default rootReducer;
