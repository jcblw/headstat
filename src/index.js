import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Entry from './Entry';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Entry host={'http://localhost:4000'} endpoint="/api/content" />,
  document.getElementById('root')
);
registerServiceWorker();
