import React from 'react';
import { ActionSheetIOS, AsyncStorage, AlertIOS, PixelRatio, Dimensions } from 'react-native';
// import segment from 'react-native-segment';
import { ddp } from './DDP';
// import DeviceInfo from 'react-native-device-info';
import openURL from './openURL';


function save(attrs) {
  const attributes = attrs;
  if (!attributes.meta) attributes.meta = {};
  attributes.meta.pixelRatio = PixelRatio.get();
  attributes.meta.dimensions = Dimensions.get('window');
  // attributes.meta.version = DeviceInfo.getVersion();
  // attributes.meta.readableVersion = DeviceInfo.getReadableVersion();
  // attributes.meta.bundleId = DeviceInfo.getBundleId();
  // attributes.meta.deviceName = DeviceInfo.getDeviceName();
  // attributes.meta.systemVersion = DeviceInfo.getSystemVersion();
  // attributes.meta.manufacturer = DeviceInfo.getManufacturer();
  // attributes.meta.model = DeviceInfo.getModel();
  // attributes.meta.deviceLocale = DeviceInfo.getDeviceLocale();
  // attributes.meta.deviceCountry = DeviceInfo.getDeviceCountry();
  // TODO: add more meta info like iOS version
  ddp.call('feelings/create', [attributes]).then((result) => {
    if (global.__DEV__) console.log("feeling submited!", result);
    // TODO: flash a toast message saying "Thanks for the feedback! We'll take it to heart."
  }).catch((error) => {
    if (global.__DEV__) console.log("feeling error.", error);
  });
}

function pickState(state) {
  // segment.track('Feedback Sheet - 2 Picked', { feeback: state });
  const attributes = { state };
  if (state === 'happy') {
    save(attributes);
    AlertIOS.alert(
      'Sweet! If you think we\'re useful, will you help us grow? 🌱',
      'Take 30 seconds to rate Posyt. A good rating helps more than you probably think.',
      [
        { text: 'I won\'t', onPress: () => {
          // segment.track('Feedback Sheet - 3 Rate - No');
        } },
        { text: 'I will', onPress: () => {
          // segment.track('Feedback Sheet - 3 Rate - Yes');
          AsyncStorage.setItem('rateApp/pressed', (new Date).toString());
          openURL('itms-apps://itunes.apple.com/app/id1037842845?mt=8');
        } },
      ]
    );
  } else {
    AlertIOS.prompt(
      `Why are you ${state}?`,
      null,
      [{ text: 'Done', onPress: (content) => {
        // segment.track('Feedback Sheet - 3 Feedback', { message: content });
        attributes.content = content;
        save(attributes);
      } }]
    );
  }
}

export function promptForFeedback() {
  // segment.track('Feedback Sheet - 1 Show');
  ActionSheetIOS.showActionSheetWithOptions({
    title: 'How do you feel about Posyt?',
    options: [
      '😄 Happy',
      '😣 Confused',
      '😢 Unhappy',
      'Cancel',
    ],
    cancelButtonIndex: 3,
  },
  (buttonIndex) => {
    if (buttonIndex === 0) {
      pickState('happy');
    } else if (buttonIndex === 1) {
      pickState('confused');
    } else if (buttonIndex === 2) {
      pickState('unhappy');
    }
  });
}
