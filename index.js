import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import { App } from './src/App';

// Expo native entry (canonical). Web is served via Expo/Metro, not Vite.
AppRegistry.registerComponent('main', () => App);

registerRootComponent(App);
