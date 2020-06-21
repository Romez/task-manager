/* eslint-disable import/prefer-default-export */
import _ from 'lodash';

export const getChatNickname = (user) => {
  if (_.has(user, 'firstName') && _.has(user, 'lastName')) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email;
};
