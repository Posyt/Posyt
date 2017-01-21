import { Linking, StatusBar } from 'react-native';
import SafariView from 'react-native-safari-view';
import Orientation from 'react-native-orientation';
import { red } from './constants';

global.onDismissLinkedView = () => {};

SafariView.addEventListener('onShow', () => {
  Orientation.unlockAllOrientations();
  StatusBar.setHidden(true, 'fade');
});

SafariView.addEventListener('onDismiss', () => {
  Orientation.lockToPortrait();
  StatusBar.setHidden(false, 'fade');
  global.onDismissLinkedView();
});

export default function openURL(url, onDismiss = () => {}) {
  global.onDismissLinkedView = onDismiss;
  const http = url.slice(0, 4).toLowerCase();
  if (http === 'http') {
    SafariView.isAvailable()
    .then(() => {
      SafariView.show({
        url,
        tintColor: red,
      });
    })
    .catch(() => {
      Linking.openURL(url);
    });
  } else {
    Linking.openURL(url);
  }
}
