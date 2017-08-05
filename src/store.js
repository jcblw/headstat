import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import { reducer as api, readEndpoint } from 'redux-json-api';
import user from './reducers/user';
import jwtParse from './middleware/jwt-parse';

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const reducer = combineReducers({
  api,
  user,
});

const enhancer = composeEnhancers(applyMiddleware(thunk, jwtParse));

export const configureStore = (payload = {}) => {
  return createStore(reducer, payload, enhancer);
};
