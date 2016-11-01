import Reactotron from 'reactotron-react-native'

Reactotron
  .configure()
  .connect({ enabled: global.__DEV__ });
