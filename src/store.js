import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import user from './reducers/user';
import { jsonapi } from './reducers/json-api';
import jwtParse from './middleware/jwt-parse';
import jsonAPIMiddleware from './middleware/json-api';

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const reducer = combineReducers({
  user,
  jsonapi,
});

const enhancer = composeEnhancers(
  applyMiddleware(thunk, jwtParse, jsonAPIMiddleware)
);

export const configureStore = (payload = {}) => {
  return createStore(reducer, payload, enhancer);
};
