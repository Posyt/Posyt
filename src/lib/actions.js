import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import { ddp } from './DDP';
// import segment from 'react-native-segment';

/*
 * action types
 */

export const SET_PLATFORM = 'SET_PLATFORM';

export const CHANGED_COLLECTION = 'CHANGED_COLLECTION';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export const SET_TAB_BAR_VISIBILITY = 'SET_TAB_BAR_VISIBILITY';
export const SET_TAB_BAR_LOCKED = 'SET_TAB_BAR_LOCKED';
export const REMOVE_TAB_BAR_TOP_MARGIN = 'REMOVE_TAB_BAR_TOP_MARGIN';

export const TOP_CARD_EXPANDED = 'TOP_CARD_EXPANDED';
export const TOP_CARD_CONTRACTED = 'TOP_CARD_CONTRACTED';
export const POP_TOP_CARD = 'POP_TOP_CARD';
export const UNPOP_LAST_CARD = 'UNPOP_LAST_CARD';
export const UNSHIFT_CARD = 'UNSHIFT_CARD';

export const PAGE_CONVERSATIONS = 'PAGE_CONVERSATIONS';

export const SELECT_CONVERSATION = 'SELECT_CONVERSATION';
export const UPDATE_CHAT = 'UPDATE_CHAT';
export const PAGE_CHAT = 'PAGE_CHAT';
export const CACHE_MESSAGE = 'CACHE_MESSAGE';
export const MESSAGE_CREATE_FAILED = 'MESSAGE_CREATE_FAILED';
export const RETRYING_MESSAGE_CREATE = 'RETRYING_MESSAGE_CREATE';
export const REMOVE_MESSAGE_FROM_CACHE = 'REMOVE_MESSAGE_FROM_CACHE';
export const LEAVE_CHAT = 'LEAVE_CHAT';

// export const NEW_DEEP_LINK = 'NEW_DEEP_LINK';
export const SET_CURRENT_DEEP_LINK = 'SET_CURRENT_DEEP_LINK';
export const CLEAR_CURRENT_DEEP_LINK = 'CLEAR_CURRENT_DEEP_LINK';

/*
 * action creators
 */

export function setPlatform(platform) {
  return {
    type: SET_PLATFORM,
    payload: { platform },
  };
}

export function changedCollection(collectionName, changeType, id) {
  return {
    type: CHANGED_COLLECTION,
    payload: {
      collectionName,
      changeType,
      id,
    },
  };
}

export function popScene() {
  return dispatch => {
    Actions.pop();
  };
}

export function loginRequest() {
  return {
    type: LOGIN_REQUEST,
  };
}
export function loginSuccess(user) {
  return {
    type: LOGIN_SUCCESS,
    payload: { user },
  };
}
export function loginFailure(error) {
  return {
    type: LOGIN_FAILURE,
    payload: { error },
  };
}

export function logoutRequest() {
  return {
    type: LOGOUT_REQUEST,
  };
}
export function logoutSuccess() {
  return {
    type: LOGOUT_SUCCESS,
  };
}
export function logoutFailure(error) {
  return {
    type: LOGIN_REQUEST,
    payload: { error },
  };
}

export function setTabBarVisibility(visible) {
  return {
    type: SET_TAB_BAR_VISIBILITY,
    payload: { visible },
  };
}
export function setTabBarLocked(locked) {
  return {
    type: SET_TAB_BAR_LOCKED,
    payload: { locked },
  };
}
export function removeTabBarTopMargin(removeTopMargin) {
  return {
    type: REMOVE_TAB_BAR_TOP_MARGIN,
    payload: { removeTopMargin },
  };
}

export function topCardExpanded() {
  return {
    type: TOP_CARD_EXPANDED,
  };
}
export function topCardContracted() {
  return {
    type: TOP_CARD_CONTRACTED,
  };
}
export function popTopCard() {
  return {
    type: POP_TOP_CARD,
  };
}
export function unpopLastCard() {
  return {
    type: UNPOP_LAST_CARD,
  };
}
export function unshiftCard(card) {
  return {
    type: UNSHIFT_CARD,
    payload: { card },
  };
}

export function pageConversations() {
  return {
    type: PAGE_CONVERSATIONS,
  };
}

// TODO: rename to refreshChat
// TODO: if called more than once, batch all the calls into 1 and wait for the previous update to complete
export function updateChat() {
  return {
    type: UPDATE_CHAT,
  };
}
export function selectConversation(id) {
  return dispatch => {
    dispatch({
      type: SELECT_CONVERSATION,
      payload: { id },
    });
    setTimeout(() => {
      dispatch(updateChat());
    }, 1000);
  };
}
export function showConversation(id) {
  return dispatch => {
    dispatch(selectConversation(id));
    Actions.chat();
  };
}
export function pageChat() {
  return {
    type: PAGE_CHAT,
  };
}
// Sending a Message
function cacheMessage(attrs) {
  return {
    type: CACHE_MESSAGE,
    payload: { attrs },
  };
}
function messageCreateFailed(attrs) {
  return {
    type: MESSAGE_CREATE_FAILED,
    payload: { attrs },
  };
}
function retryingMessageCreate(attrs) {
  return {
    type: RETRYING_MESSAGE_CREATE,
    payload: { attrs },
  };
}
// This is for when a message fails and the user does not want to retry sending.
// Normally the chat reducer will take care of removing cached messages that have
//   been successfully persisted to the API.
function removeMessageFromCache(attrs) {
  return {
    type: REMOVE_MESSAGE_FROM_CACHE,
    payload: { attrs },
  };
}
export function sendMessage(attrs, opts = {}) {
  return dispatch => {
    if (opts.retry) {
      dispatch(retryingMessageCreate(attrs));
      // segment.track('Message Send A - Retry', attrs);
    } else if (opts.delete) {
      dispatch(removeMessageFromCache(attrs));
      // segment.track('Message Send B - Delete', attrs);
    } else {
      dispatch(cacheMessage(attrs));
      // segment.track('Message Send 1 - Cache Locally', attrs);
    }
    dispatch(updateChat());
    if (opts.delete) return; // Don't try to persist on delete
    ddp.call('messages/create', [_.pick(attrs, ['content', 'conversationId', 'location'])])
    .then(() => {
      // segment.track('Message Send 2 - Save Success', attrs);
    }).catch((err) => {
      setTimeout(() => {
        dispatch(messageCreateFailed(attrs));
        dispatch(updateChat());
        // segment.track('Message Send 2 - Save Failed', { ...attrs, error: err.reason });
      }, 500);
    });
  };
}
export function leaveChat() {
  return {
    type: LEAVE_CHAT,
  };
}


export function setCurrentDeepLink(currentDeepLink) {
  return {
    type: SET_CURRENT_DEEP_LINK,
    payload: {
      currentDeepLink,
    },
  };
}
export function newDeepLink(deepLink) {
  return dispatch => {
    dispatch(setCurrentDeepLink(deepLink));
    if (deepLink._id && /^posyt|article$/.test(deepLink._type)) {
      ddp.call('cards/get', [deepLink._type, deepLink._id]).then(card => {
        const cardWithDeepLink = {
          ...card,
          deepLink,
          _type: deepLink._type,
        };
        dispatch(unshiftCard(cardWithDeepLink));
      })
    }
  };
}
export function clearCurrentDeepLink() {
  return {
    type: CLEAR_CURRENT_DEEP_LINK,
  };
}
