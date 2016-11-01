'use strict';

import {
  SET_PLATFORM
} from '../lib/actions'

const initialState = {
  isMobile: true,
  platform: '',
}

/**
 * ## deviceReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function deviceReducer (state = initialState, action) {
  switch (action.type) {
  case SET_PLATFORM:
    return {
      ...state,
      platform: action.payload.platform
    }
  }

  return state;
}
