import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
// import devTools from 'remote-redux-devtools';
import Reactotron from 'reactotron-react-native';
import createReactotronEnhancer from 'reactotron-redux';
import rootReducer from '../reducers/index';
import { apolloClient } from './apolloClient';

const reactotronEnhancer = createReactotronEnhancer(Reactotron);

const logger = createLogger({
  predicate: (getState, action) => __DEV__ // Only log in dev mode
});

const middleware = applyMiddleware(
  thunk,
  apolloClient.middleware(),
  // logger // NOTE: logger must be last // NOTE: this is noisy
);

const middlewareAndDevTools = compose(
  reactotronEnhancer,
  middleware,
  // devTools()
);

const createStoreWithMiddleware = (global.__DEV__ ? middlewareAndDevTools : middleware)(createStore);

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(rootReducer, initialState);

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('../reducers/index').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
