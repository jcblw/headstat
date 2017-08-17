import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Entry from './Entry';
import registerServiceWorker from './registerServiceWorker';

const portPattern = /:[0-9]+/g;
let host = window.location.origin;

if (host.match(portPattern)) {
  host = host.replace(portPattern, ':4000');
}

ReactDOM.render(
  <Entry host={host} endpoint="/api/content" />,
  document.getElementById('root')
);
registerServiceWorker();
