import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from './store.js';
import App from './App';

export default props => {
  return (
    <Provider store={configureStore({})}>
      <App {...props} />
    </Provider>
  );
};
