import {
  SET_CURRENT_DEEP_LINK,
  CLEAR_CURRENT_DEEP_LINK,
} from '../lib/actions';

const initialState = {
  currentDeepLink: null,
};

export default function deepLinkReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_DEEP_LINK:
      return {
        ...state,
        currentDeepLink: action.payload.currentDeepLink,
      };
    case CLEAR_CURRENT_DEEP_LINK:
      return {
        ...state,
        currentDeepLink: null,
      };
    default:
      return state;
  }
}
