// import { Alert } from 'react-native';
import FBSDK from 'react-native-fbsdk';
import { ddp } from './DDP';
import {
  loginRequest,
  loginFailure,
  logoutRequest,
  logoutFailure,
} from './actions';
import { store } from './store';

const FB_PERMISSIONS = ['email', 'public_profile']; //, 'user_friends']
// 'user_actions.news', 'user_likes', 'user_location'];
// TODO: enable these other permissions when the app is ready to be submitted to FB for approval


export default function loginWithFacebook() {
  store.dispatch(loginRequest());
  // FBSDK.LoginManager.setLoginBehavior('native') // TODO: find the ideal behaviour https://github.com/facebook/react-native-fbsdk/blob/master/react-native-fbsdklogin/js/FBSDK.LoginManager.ios.js
  FBSDK.LoginManager.logInWithReadPermissions(FB_PERMISSIONS).then((result) => {
    if (result.isCancelled) {
      if (global.__DEV__) console.log('fb login canceled');
      store.dispatch(loginFailure('Facebook login canceled'));
    } else {
      if (global.__DEV__) console.log('fb logged in!');
      FBSDK.AccessToken.getCurrentAccessToken().then((response) => {
        if (response) {
          // NOTE: completed is NOT called here -- Actions.fbLogin.completed(response);
          loginWithFBToken(response.accessToken)
        } else {
          if (global.__DEV__) console.log('fb access token not found');
          store.dispatch(loginFailure('Facebook credentials not found'));
        }
      });
    }
  }, (error) => {
    if (global.__DEV__) console.log('fb login failed: ', error);
    // Actions.fbLogin.failed(result)
    // TODO: add a failed to login toast
    // NOTE: the alert does not work
    // Alert.alert(
    //   'Failed to Sign In',
    //   error,
    //   [
    //     { text: 'Cancel', onPress: () => { if (global.__DEV__) console.log('fb login canceled') } },
    //     { text: 'Retry', onPress: () => { loginWithFacebook() } },
    //   ]
    // );
  });
}

export function attemptLoginWithStashedToken() {
  // Try to login over ddp if fb already logged in
  FBSDK.AccessToken.getCurrentAccessToken().then((response) => {
    if (response) {
      if (global.__DEV__) console.log('fb credentials found');
      loginWithFBToken(response.accessToken);
    } else {
      if (global.__DEV__) console.log('no fb credentials found');
    }
  });
}

function loginWithFBToken(fbToken) {
  if (global.__DEV__) console.log("getting FB login options...", fbToken);
  ddp.login({ fbsdk: { accessToken: fbToken } }).catch((error) => {
    // TODO: MAYBE: do something on failed login
  });
}
