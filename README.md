# Posyt


## Getting Started

1. Run `npm install`
2. Download the FBSDK https://developers.facebook.com/docs/ios/getting-started/#download
3. Open XCode `open ios/Posyt.xcodeproj`
4. Press play

### Troubleshooting

- Make sure the posytDomain in constants.js is set to `localhost` or the IP of your development machine


## Releasing updates

	https://github.com/Microsoft/react-native-code-push#releasing-updates

The default: (remember to update the CHANGELOG...)
NOTE: release-react will bundle the main.jsbundle as well, so you don't need to run react-native bundle

	code-push release-react Posyt ios -d "Production" -des "CHANGELOG..." --rollout "100%"


## Packaging

	XCode Product > Scheme > Edit Scheme -- set Build Configuration to Release and uncheck debug
	XCode Click the Posyt project in left bar > Build Settings -- in Code Signing change the profile to prod and the identities to distrubution

	react-native bundle --entry-file index.ios.js --platform ios --dev false --bundle-output ios/main.jsbundle

	XCode Set target to iPhone in top bar, Select the Posyt project in left bar, Product > Archive
	Fabric should automatically find the new build and prompt you to distribute it to testers, if not run archive again


## Gotchas

### Branch
  https://github.com/BranchMetrics/react-native-branch-deep-linking/issues/18#issuecomment-231533316
