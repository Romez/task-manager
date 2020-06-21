/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import gon from 'gon';

export const channelsSlice = createSlice({
  name: 'channels',
  initialState: {
    byId: gon.channels.reduce((acc, channel) => ({ ...acc, [channel.id]: channel }), {}),
    allIds: gon.channels.map(({ id }) => id),
    currentChannelId: gon.currentChannelId,
  },
  reducers: {
    addChannel: (state, { payload }) => {
      state.allIds.push(payload.id);
      state.byId[payload.id] = payload;
    },
    renameChannel: (state, { payload }) => {
      state.byId[payload.id].name = payload.name;
    },
    removeChannel: (state, { payload }) => {
      state.allIds = state.allIds.filter((id) => id !== payload.id);
      state.byId = _.omit(state.byId, payload.id);
      if (state.currentChannelId === payload.id) {
        state.currentChannelId = _.first(state.allIds);
      }
    },
    switchToChannel: (state, { payload }) => {
      state.currentChannelId = payload.channelId;
    },
  },
});

export const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    byId: gon.messages.reduce((acc, message) => ({ ...acc, [message.id]: message }), {}),
    allIds: gon.messages.map(({ id }) => id),
  },
  reducers: {
    addMessage: (state, { payload }) => {
      const { id, attributes } = payload;
      state.byId[id] = attributes;
      state.allIds.push(id);
    },
  },
  extraReducers: {
    [channelsSlice.actions.removeChannel]: (state, { payload }) => {
      const messageId = _.findKey(state.byId, ({ channelId }) => channelId === payload.id);

      state.allIds = state.allIds.filter((id) => id !== Number(messageId));
      state.byId = _.omit(state.byId, messageId);
    },
  },
});

export const usersSlice = createSlice({
  name: 'users',
  initialState: {
    byId: gon.users.reduce((acc, user) => ({ ...acc, [user.id]: user }), {}),
    allIds: gon.users.map(({ id }) => id),
    currentUser: gon.user,
  },
  extraReducers: {
    [messagesSlice.actions.addMessage]: (state, { payload }) => {
      const {
        relationships: { user },
      } = payload;

      const { id, attributes } = user;
      if (!state.byId[id]) {
        state.byId[id] = attributes;
        state.allIds.push(id);
      }
    },
  },
});
