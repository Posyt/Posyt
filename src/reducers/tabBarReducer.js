import {
  SET_TAB_BAR_VISIBILITY,
  SET_TAB_BAR_LOCKED,
  REMOVE_TAB_BAR_TOP_MARGIN,
} from '../lib/actions';

const initialState = {
  visible: true,
  locked: false,
};

export default function tabBarReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TAB_BAR_VISIBILITY:
      return {
        ...state,
        visible: action.payload.visible,
      };
    case SET_TAB_BAR_LOCKED:
      return {
        ...state,
        locked: action.payload.locked,
      };
    case REMOVE_TAB_BAR_TOP_MARGIN:
      return {
        ...state,
        removeTopMargin: action.payload.removeTopMargin,
      };
    default:
      return state;
  }
}
