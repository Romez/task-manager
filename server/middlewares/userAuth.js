const userAuth = (ctx, next) => {
  if (ctx.state.currentUser.isGuest) {
    return ctx.throw(403);
  }

  return next();
};

export default userAuth;
