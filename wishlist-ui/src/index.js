import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Auth0 from './Auth0';

import config from './config.json';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Auth0 domain={config.domain} client_id={config.clientId} redirect_uri={window.location.origin}>
      <App />
    </Auth0>
  </React.StrictMode>,
  document.getElementById('root')
);
