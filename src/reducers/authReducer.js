import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,

  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,

  CHANGED_COLLECTION,
} from '../lib/actions';
import { mongo } from '../lib/Mongo';

const initialState = {
  loggedIn: false,
  loggingIn: false,
  currentUser: null,
  error: null,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loggingIn: true,
        error: null,
      };
    case LOGOUT_REQUEST:
      return {
        ...state,
        error: null,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        loggingIn: false,
        currentUser: action.payload.user,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        currentUser: null,
      };
    case LOGOUT_FAILURE:
      return {
        ...state,
        error: action.payload.error,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        loggingIn: false,
        error: action.payload.error,
      };
    case CHANGED_COLLECTION:
      if (state.currentUser && action.payload.collectionName === 'users' && action.payload.id === state.currentUser._id) {
        return {
          ...state,
          currentUser: mongo.db.users.findOne({ _id: action.payload.id }),
        };
      }
    default:
      return state;
  }
}
