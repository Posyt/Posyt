// Polyfill the process functionality needed for minimongo-cache
import './process.polyfill';
import {
  AsyncStorage,
  AppStateIOS,
} from 'react-native';
import Minimongo from 'minimongo-cache';
import { changedCollection } from './actions';
import { store } from './store';
import { ddp } from './DDP';

// TODO: persistance load: switch to this when ready for faster startup and offline use
// mongo.initialize = function() {
//   return new Promise(function(resolve, reject) {
//     AsyncStorage.getItem('serializedDB').then(function(serializedDB) {
//       if (serializedDB) {
//         mongo.db = minimongo.deserialize(JSON.parse(serializedDB))
//         AsyncStorage.getItem('userId').then(function(userId) {
//           if (userId) ddp.userId = userId
//           var user = mongo.db.users.get(ddp.userId)
//           if (user) {
//             Actions.login.completed(user)
//             for (let collectionName of collectionNames) {
//               Actions["changed" + _.capitalize(collectionName)]();
//             }
//           }
//           resolve(mongo)
//         });
//       } else {
//         mongo.db = new minimongo();
//         for (let collectionName of collectionNames) {
//           mongo.db.addCollection(collectionName);
//         }
//         resolve(mongo)
//       }
//     });
//   })
// }

class Mongo {
  constructor() {
    this.collectionNames = ['users', 'posyts', 'articles', 'conversations', 'messages'];
    this.db = new Minimongo();
    this._addCollections();
    // TODO: UNHACK: there is some sort of race condition here where ddp is trying to build its instance while mongo builds its instance
    setTimeout(() => {
      this._observeDDPCollections();
    }, 0);
    AppStateIOS.addEventListener('change', () => this._handleAppStateChange());
  }

  persist() {
    AsyncStorage.setItem('serializedDB', JSON.stringify(this.db.serialize()));
  }

  upsert(collectionName, doc) {
    this.db[collectionName].upsert(doc);
    store.dispatch(changedCollection(collectionName, 'changed', doc._id));
  }

  remove(collectionName, _id) {
    this.db[collectionName].remove({ _id });
    store.dispatch(changedCollection(collectionName, 'remove', _id));
  }

  _addCollections() {
    for (const collectionName of this.collectionNames) {
      this.db.addCollection(collectionName);
    }
  }

  _observeDDPCollections() {
    for (const collectionName of this.collectionNames) {
      const observer = ddp.observe(collectionName);
      observer.added = (id) => this._added(collectionName, id);
      observer.changed = (id) => this._changed(collectionName, id);
      observer.removed = (id) => this.remove(collectionName, id);
    }
  }

  _added(collectionName, id) {
    this._ddpUpsert(collectionName, id);
    store.dispatch(changedCollection(collectionName, 'added', id));
  }

  _changed(collectionName, id) {
    this._ddpUpsert(collectionName, id);
    store.dispatch(changedCollection(collectionName, 'changed', id));
  }

  _ddpUpsert(collectionName, id) {
    this.db[collectionName].upsert(ddp.collections[collectionName][id]);
  }

  _handleAppStateChange(currentAppState) {
    if (currentAppState === 'active') {
      // TODO: unserialize
    } else if (currentAppState === 'background') {
      // Serialize and save the db
      this.persist();
    }
  }
}

export const mongo = new Mongo();
