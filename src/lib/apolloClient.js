import ApolloClient, { createNetworkInterface } from 'apollo-client';
import {
  AsyncStorage,
} from 'react-native';
import {
  posytGraphQLUri,
} from './constants';

const networkInterface = createNetworkInterface({
  uri: posytGraphQLUri,
});

networkInterface.use([{
  async applyMiddleware(req, next) {
    if (!req.options.headers) req.options.headers = {};
    const token = await AsyncStorage.getItem('loginToken');
    req.options.headers.authorization = token;
    next();
  }
}]);

export const apolloClient = new ApolloClient({
  networkInterface,
});
