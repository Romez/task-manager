import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import axios from 'axios';

import reducer from './store';
import initWebSocket from './socket';

import App from './App';

axios.defaults.headers.post['Content-Type'] = 'application/vnd.api+json';

export default () => {
  const store = configureStore({ reducer });
  initWebSocket(store);

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('chat'),
  );
};
