/* eslint-disable import/prefer-default-export */

export const getChatNickname = (user) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email;
};
