import { createSelector } from '@reduxjs/toolkit';

export const selectChannelsAllIds = (store) => store.channels.allIds;

export const selectChannelsById = (store) => store.channels.byId;

export const selectCurrentChannelId = (store) => store.channels.currentChannelId;

export const selectMessagesById = (store) => store.messages.byId;

export const selectMessageAllIds = (store) => store.messages.allIds;

export const selectCurrentChannelMessagesIds = createSelector(
  [selectCurrentChannelId, selectMessageAllIds, selectMessagesById],
  (currentChannelId, messagesAllIds, messagesById) =>
    messagesAllIds.filter((id) => {
      const { channelId } = messagesById[id];
      return channelId === currentChannelId;
    }),
);

export const selectUser = (store) => store.users.currentUser;

export const selectUsersById = (store) => store.users.byId;

export const selectUsersAllIds = (store) => store.users.allIds;
