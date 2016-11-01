import React from 'react';
import { Linking } from 'react-native';
// import SafariView from 'react-native-safari-view';
import { red } from './constants';

global.onDismissLinkedView = () => {};

// SafariView.addEventListener('onDismiss', () => {
//   global.onDismissLinkedView();
// });

export default function openURL(url, onDismiss = () => {}) {
  global.onDismissLinkedView = onDismiss;
  const http = url.slice(0, 4).toLowerCase();
  if (http === 'http') {
    // SafariView.isAvailable()
    // .then(() => {
    //   SafariView.show({
    //     url,
    //     tintColor: red,
    //   });
    // })
    // .catch(() => {
    //   Linking.openURL(url);
    // });
  } else {
    Linking.openURL(url);
  }
}
