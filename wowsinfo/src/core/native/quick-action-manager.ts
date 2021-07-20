import {NativeModules, NativeEventEmitter} from 'react-native';
import {SafeAction} from '../../core';
const manager = NativeModules.QuickActionManager;
const eventEmitter = NativeModules.QuickActionEventEmitter;

class QuickActionManager {
  constructor() {
    const emitter = new NativeEventEmitter(eventEmitter);
    emitter.addListener('quick_action', (type: string) => {
      console.log('quick action - ', type);
      // TODO: the app might not be ready so need to check somewhere or even need to tell the native side
      switch (type) {
        case 'search':
          SafeAction('Search');
          break;
        case 'warships':
          SafeAction('Warship');
          break;
        case 'account':
          // SafeAction('Statistics', {info: main});
          SafeAction('Statistics');
          break;
        default:
          console.log(`Unknown action - ${type}`);
      }
    });
  }

  addMainAccount(name: string) {
    manager.addMainAccount(name);
  }

  performPendingShortcut() {
    manager.performPendingShortcut();
  }
}

export {QuickActionManager};
