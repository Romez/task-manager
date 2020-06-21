/* eslint-disable no-param-reassign */
import { combineReducers } from 'redux';

import { channelsSlice, messagesSlice, usersSlice } from './slices';

export * from './selectors';

export const actions = {
  ...channelsSlice.actions,
  ...messagesSlice.actions,
};

export default combineReducers({
  channels: channelsSlice.reducer,
  messages: messagesSlice.reducer,
  users: usersSlice.reducer,
});
