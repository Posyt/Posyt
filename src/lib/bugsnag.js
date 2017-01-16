import { Client } from 'bugsnag-react-native';
import { bugsnagKey } from './constants';

const bugsnag = new Client(bugsnagKey);

export default bugsnag;
