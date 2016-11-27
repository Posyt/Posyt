import {
  AsyncStorage,
  AppState,
} from 'react-native';
import {
  ddpConnectRequest,
  ddpConnectSuccess,
  ddpConnectFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
} from './actions';
import {
  posytDomain,
  posytPort,
  posytSSL,
} from './constants';
import DDPClient from 'node-ddp-client';
import { store } from './store';
import { deepLinker } from './DeepLinker';
import _ from 'lodash';
import segment from './segment';

class DDP {
  constructor() {
    this._connected = false;
    this._connecting = false;
    this.userId = null;
    this.authToken = null;
    this.authTokenExpires = null;
    this._subs = {}; // cache subs in case connection is refreshed and subs need to be replayed
    this._initDDPClient();
    this.getConnection();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  // Try to connect with the server or just resolve if already connected
  getConnection() {
    return new Promise((resolve, reject) => {
      if (this._connected) {
        resolve(this._ddpClient);
      } else if (this._connecting) {
        this._pollForConnection(resolve, reject);
      } else {
        this._connecting = true;
        store.dispatch(ddpConnectRequest());
        this._ddpClient.connect((error, wasReconnect) => {
          if (wasReconnect) {
            if (global.__DEV__) console.log('DDP Reestablishment of a connection.');
          }
          // If autoReconnect is true, this back will be invoked each time
          // a server connection is re-established
          if (error) {
            this._connected = false;
            if (global.__DEV__) console.log('DDP connection error!');
            store.dispatch(ddpConnectFailure());
            reject(error);
          } else {
            this._connected = true;
            if (global.__DEV__) console.log('DDP connected!');
            store.dispatch(ddpConnectSuccess());
            // Try to resume the session
            this.loginWithToken()
            .then(() => {
              this.refreshSubscriptions();
              resolve(this._ddpClient);
            })
            .catch(() => {
              this.refreshSubscriptions();
              resolve(this._ddpClient);
            });
          }
          this._connecting = false;
        });
      }
    });
  }

  // Close the ddp connection
  close() {
    this._connected = false;
    this.userId = undefined;
    return this._ddpClient.close();
  }

  // Promised based subscription
  // TODO: consider auto resubscribing on login/logout
  subscribe(pubName: string, params: Array<any> = []) {
    if (params && !_.isArray(params)) {
      console.warn('Params must be passed as an array to subscribe');
    }
    return new Promise((resolve, reject) => {
      this.getConnection().then((ddpClient) => {
        if (global.__DEV__) console.log('DDP subscribing to ', pubName, 'params: ', params);
        const id = ddpClient.subscribe(pubName, params, () => {
          if (global.__DEV__) console.log('DDP subscribed! to ', pubName, 'params: ', params);
        });
        this._subs[id] = { pubName, params };
        resolve(id);
      });
    });
  }

  unsubscribe(id: number, options: Object) {
    return new Promise((resolve, reject) => {
      if (options && options.keepData) {
        resolve(delete this._subs[id]);
      } else {
        this.getConnection().then((ddpClient) => {
          if (global.__DEV__) console.log('DDP unsubscribing from ', id);
          ddpClient.unsubscribe(id);
          delete this._subs[id];
          resolve(true);
        });
      }
    });
  }

  refreshSubscriptions() {
    const subs = { ...this._subs };
    for (let id in subs) {
      const sub = subs[id];
      this.unsubscribe(id);
      this.subscribe(sub.pubName, sub.params);
    }
  }

  // Pass through observe
  observe(collectionName: string) {
    return this._ddpClient.observe(collectionName);
  }

  // Promised based method call
  call(methodName: string, params: Array<any>) {
    params = params || undefined;
    if (params && !_.isArray(params)) {
      console.warn('Params must be passed as an array to this.call');
    }

    return new Promise((resolve, reject) => {
      this.getConnection().then((ddpClient) => {
        ddpClient.call(methodName, params, (error, result) => {
          // if (global.__DEV__) console.log('called function:', methodName)//, params, 'result: ', result, 'error: ', error);
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }, () => { // callback which fires when server has finished sending any updated documents
          // if (global.__DEV__) console.log(ddpClient.collections.posts);
        });
      });
    });
  }

  // Log in with a saved token
  loginWithToken() {
    if (global.__DEV__) console.log('Logging in with resume token.');
    return new Promise((resolve, reject) => {
      // Check if we have a loginToken in persistent client storage
      AsyncStorage.getItem('loginToken').then((token) => {
        // Login with said token
        if (token) {
          var options = { resume: token };
          this.login(options).then((result) => {
            resolve(result);
          });
        } else {
          if (global.__DEV__) console.log('No token found');
          reject();
        }
      });
    });
  }

  // Log in with email and password
  loginWithPassword(email: string, password: string) {
    if (global.__DEV__) console.log('Logging in with email and password.');
    const options = { user: { email }, password };
    return this.login(options);
  }

  // Log in
  login(options: Object) {
    store.dispatch(loginRequest());
    return new Promise((resolve, reject) => {
      this.call('login', [options]).then((result) => {
        if (global.__DEV__) console.log('DDP logged in!', result);

        this.userId = result.id;
        this.authToken = result.token;
        this.authTokenExpires = result.tokenExpires;

        AsyncStorage.setItem('userId', result.id);
        AsyncStorage.setItem('loginToken', result.token);
        AsyncStorage.setItem('loginTokenExpires', JSON.stringify(result.tokenExpires));

        const user = this.collections.users[result.id];

        // TODO: move all Actions back to CurrentUserStore and only call the login and logout actions from there
        // NOTE: refresh all dpp connections in other Stores this require auth on login.completed
        // TODO: MAYBE: FIX: If this gets called before the other components are listening they will not get the completed events. find a way to make sure they are listening. Or trigger them another way...
        store.dispatch(loginSuccess(user));

        deepLinker.branch.setIdentity(result.id);
        segment.identify(result.id, {
          username: _.get(user, 'username'),
          numPosyts: _.get(user, 'meta.numPosyts'),
          numConversations: _.get(user, 'meta.numConversations'),
          numUnreadConversations: _.get(user, 'meta.numUnreadConversations'),
          numMessages: _.get(user, 'meta.numMessages'),
          numLeads: _.get(user, 'meta.numLeads'),
          email: _.get(user, 'emails[0].address'),
          phone: _.get(user, 'phones[0].number'),
          createdAt: _.get(user, 'createdAt'),
        });

        resolve(result);
      }).catch((error) => {
        if (global.__DEV__) console.log('DDP login failed.', error);

        this.userId = undefined;
        this.authToken = null;
        this.authTokenExpires = null;
        store.dispatch(loginFailure(error));

        reject(error);
      });
    });
  }


  // Log out
  logout() {
    store.dispatch(logoutRequest());
    return new Promise((resolve, reject) => {
      this.call('logout', []).then((res) => {
        if (global.__DEV__) console.log('Logged out.');
        if (global.__DEV__) console.log('deleting the auth tokens');
        AsyncStorage.multiRemove(['userId', 'loginToken', 'loginTokenExpires']);
        this.userId = undefined;
        this.authToken = null;
        store.dispatch(logoutSuccess());
        deepLinker.branch.logout();
        segment.reset();
        resolve(res);
      }).catch((err) => {
        if (global.__DEV__) console.log('Log out err', err);
        store.dispatch(logoutFailure(err));
        reject(err);
      });
    });
  }

  _initDDPClient() {
    this._ddpClient = new DDPClient({
      // All properties optional, defaults shown
      host: posytDomain,
      port: posytPort,
      ssl: posytSSL,
      autoReconnect: true,
      autoReconnectTimer: 500,
      maintainCollections: true,
      ddpVersion: '1',  // ['1', 'pre2', 'pre1'] available
      // Use a full url instead of a set of `host`, `port` and `ssl`
      // url: 'wss://example.com/websocket'
      // socketConstructor: WebSocket // Another constructor to create new WebSockets
    });
    this.collections = this._ddpClient.collections;
    this._addOidToDDPClientEJSON();
    // NOTE: these logs can get very noisy. Leave commented out in normal development
    // if (global.__DEV__) this._ddpClient.on('socket-close', function(code, message) { console.log('ddp socket close: %s %s', code, message); });
    // if (global.__DEV__) this._ddpClient.on('socket-error', function(error) { console.log('ddp socket error: %j', error); });
  }

  // Connect and close ddp on app state change
  _handleAppStateChange = (currentAppState) => {
    if (global.__DEV__) console.log('app state changed to ', currentAppState);
    if (currentAppState === 'active') {
      this._connected = false;
      this.getConnection();
    } else if (currentAppState === 'background') {
      this.close();
      this.userId = null;
      this.authToken = null;
      this.authTokenExpires = null;
    }
  }

  // Poll for ddp connection every 100ms while _connecting
  _pollForConnection(resolve, reject, timeout = 50) {
    setTimeout(() => {
      if (global.__DEV__) console.log('DDP polling for connection');
      if (this._connecting) {
        this._pollForConnection(resolve, reject, Math.min(timeout + 50, 10000));
      } else {
        if (this._connected) {
          resolve(this._ddpClient);
        } else {
          reject({});
        }
      }
    }, timeout);
  }

  _addOidToDDPClientEJSON() {
    // if (global.__DEV__) console.log('DDP oid type exists:', this._ddpClient.EJSON._getTypes().oid);
    this._ddpClient.EJSON.addType('oid', (oid) => oid);
  }
}

export const ddp = new DDP();
