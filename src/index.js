import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Entry from './Entry';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Entry host="https://api.prod.headspace.com" endpoint="/content" />,
  document.getElementById('root')
);
registerServiceWorker();
