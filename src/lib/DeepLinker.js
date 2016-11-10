import {
  AppState,
} from 'react-native';
import {
  newDeepLink,
  clearCurrentDeepLink,
} from './actions';
// import branch from 'react-native-branch';
import { store } from './store';

class DeepLinker {
  constructor() {
    // this.branch = branch;
    // // if (global.__DEV__) branch.setDebug();
    this._init();
    AppState.addEventListener('change', () => this._handleAppStateChange());
  }

  _init() {
    branch.subscribe(({ params, error, uri }) => {
      // // if (global.__DEV__) console.log('branch.subscribe', params, error, uri);
      if (!error && params) store.dispatch(newDeepLink(params));
      // // if (params) { /* handle branch link */ }
      // // else { /* handle uri */ }
    });
  }

  _handleAppStateChange(currentAppState) {
    if (currentAppState === 'active') {
      this._init();
    } else if (currentAppState === 'background') {
      store.dispatch(clearCurrentDeepLink());
    }
  }
}

export const deepLinker = new DeepLinker();
