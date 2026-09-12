import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import { App } from './src/App';

// Register both 'main' (for MainActivity.kt) and 'Warnly'
AppRegistry.registerComponent('main', () => App);
AppRegistry.registerComponent('Warnly', () => App);

registerRootComponent(App);
