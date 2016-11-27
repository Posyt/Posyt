import {
  DDP_CONNECT_REQUEST,
  DDP_CONNECT_SUCCESS,
  DDP_CONNECT_FAILURE,
} from '../lib/actions';

const initialState = {
  connecting: false,
  connected: false,
};

export default function ddpReducer(state = initialState, action) {
  switch (action.type) {
    case DDP_CONNECT_REQUEST:
      return {
        ...state,
        connecting: true,
        connected: false,
      };
    case DDP_CONNECT_SUCCESS:
      return {
        ...state,
        connecting: false,
        connected: true,
      };
    case DDP_CONNECT_FAILURE:
      return {
        ...state,
        connecting: false,
        connected: false,
      };
    default:
      return state;
  }
}
