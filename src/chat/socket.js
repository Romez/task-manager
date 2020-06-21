import socket from 'socket.io-client';

import debug from './lib/logger';
import { actions } from './store';
import { chatEvents } from '../../constants';

const log = debug('WS');

const initWebSocket = (store) => {
  const wsConnection = socket('/');

  wsConnection.on('connect', () => {
    log('CONNECTED');
  });

  wsConnection.on('disconnect', () => {
    log('DISCONNECTED');
  });

  wsConnection.on(chatEvents.newChannel, ({ data }) => {
    const { attributes } = data;
    store.dispatch(actions.addChannel(attributes));
  });

  wsConnection.on(chatEvents.renameChannel, ({ data }) => {
    const { attributes } = data;
    store.dispatch(actions.renameChannel(attributes));
  });

  wsConnection.on(chatEvents.removeChannel, ({ data }) => {
    const { id } = data;
    store.dispatch(actions.removeChannel({ id }));
  });

  wsConnection.on(chatEvents.newMessage, ({ data }) => {
    store.dispatch(actions.addMessage(data));
  });
};

export default initWebSocket;
