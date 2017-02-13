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
  applyMiddleware(req, next) {
    if (!req.options.headers) req.options.headers = {};
    // console.log(global.authToken)
    const authToken = '52KIpAUrC-ZUQhY6iellioVTq37FTffZ4_LMGu705SY';
    if (authToken) req.options.headers.authorization = authToken;
    next();
  }
}]);

export const apolloClient = new ApolloClient({
  networkInterface,
});
