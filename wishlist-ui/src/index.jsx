import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { Auth0Provider } from '@auth0/auth0-react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import config from './config.json';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      redirectUri={window.location.origin}
      audience={config.audience}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorkerRegistration.unregister();
