import { AppRegistry } from 'react-native';
import { App } from './src/App';
import appConfig from './app.json';

const appName = appConfig.name || 'Warnly';

AppRegistry.registerComponent(appName, () => App);
