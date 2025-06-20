import { combineReducers } from 'redux';
import protocolosReducer from './protocolosReducer';
// import pacientesReducer from './pacientesReducer';
// import configuracionReducer from './configuracionReducer';

const rootReducer = combineReducers({
  protocolos: protocolosReducer,    
});

export default rootReducer;
