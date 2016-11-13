import React from 'react';
import { Alert } from 'react-native';
import { Buffer } from 'buffer';
import FBSDK from 'react-native-fbsdk';
import _ from 'lodash';
import { posytUri } from './constants';
import { ddp } from './DDP';

const FB_PERMISSIONS = ['email', 'public_profile']; //, 'user_friends']
// 'user_actions.news', 'user_likes', 'user_location'];
// TODO: enable these other permissions when the app is ready to be submitted to FB for approval


export default function loginWithFacebook() {
  // FBSDK.LoginManager.setLoginBehavior('native') // TODO: find the ideal behaviour https://github.com/facebook/react-native-fbsdk/blob/master/react-native-fbsdklogin/js/FBSDK.LoginManager.ios.js
  FBSDK.LoginManager.logInWithReadPermissions(FB_PERMISSIONS).then((result) => {
    if (result.isCancelled) {
      if (global.__DEV__) console.log('fb login canceled');
    } else {
      if (global.__DEV__) console.log('fb logged in!');
      FBSDK.AccessToken.getCurrentAccessToken().then((response) => {
        if (response) {
          // NOTE: completed is NOT called here -- Actions.fbLogin.completed(response);
          loginWithFBToken(response.accessToken)
        } else {
          if (global.__DEV__) console.log('fb access token not found');
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
      loginWithFBToken(response.accessToken)
    } else {
      if (global.__DEV__) console.log('no fb credentials found');
    }
  });
}

// // Everything needed to log in with facebook
// function generateState(loginStyle, credentialToken, redirectUrl) {
//   return new Buffer(JSON.stringify(
//     {
//       loginStyle,
//       credentialToken,
//       redirectUrl,
//     }
//   )).toString('base64');
// }
//
// function constructMeteorFacebookOauthUrl(fbToken) {
//   const expiresIn = (new Date(fbToken.expirationTime)).getTime() -
//                   (new Date).getTime();
//   const state = generateState('popup', fbToken.accessToken);
//   // TODO: extract host and ssl into config/constants
//   const url = posytUri+'/_oauth/facebook/?accessToken='+
//             fbToken.accessToken+'&expiresIn='+expiresIn+'&state='+state;
//   return url;
// }
//
// function parseMeteorFacebookResponseHTML(response) {
//   const re = new RegExp("<div id=\"config\" style=\"display:none;\">(.*?)</div>");
//   const found = re.exec(response._bodyText);
//   const config = JSON.parse(found[1]);
//   return config
// }

function loginWithFBToken(fbToken) {
  if (global.__DEV__) console.log("getting FB login options...", fbToken);
  ddp.login({ fbsdk: { accessToken: fbToken } }).catch((error) => {
    // TODO: MAYBE: do something on failed login
  });
  // const url = constructMeteorFacebookOauthUrl(fbToken);
  // // TODO: MAYBE: may not be a problem anymore. If this fetch fails automatically prompt a new fb login (just once) and then try again with new credentials.
  // fetch(url).then((response) => {
  //   const config = parseMeteorFacebookResponseHTML(response);
  //   const loginOptions = {
  //     oauth: {
  //       credentialToken: config.credentialToken,
  //       credentialSecret: config.credentialSecret,
  //     },
  //   };
  //   ddp.login(loginOptions).catch((error) => {
	// 		// TODO: MAYBE: do something on failed login
  //   });
  // });
}
