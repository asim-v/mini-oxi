// En tu archivo redux/store.js o similar
import { persistStore } from 'redux-persist';
import { createStore,applyMiddleware } from 'redux';

import rootReducer from './reducers';

const store = createStore(
  rootReducer,

);

const persistor = persistStore(store);

export { store, persistor };
