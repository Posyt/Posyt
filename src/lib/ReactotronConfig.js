import Reactotron, { trackGlobalErrors } from 'reactotron-react-native'

Reactotron
  .configure()
  .use(trackGlobalErrors())
  .connect({ enabled: global.__DEV__ });
