import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import thunkMiddleware from 'redux-thunk';
import { reducer, initialState } from './reducer';

export const initStore = (state = initialState) =>
  createStore(reducer, state, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export default initStore;
