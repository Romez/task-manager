import i18next from 'i18next';

import { User } from '../entity';
import encrypt from '../lib/secure';

export default (router) => {
  router.get('signIn', '/sessions/new', async (ctx) => ctx.render('sessions/new', { signInForm: {} }));

  router.post('session', '/sessions', async (ctx) => {
    const { email, password } = ctx.request.body;

    const passwordDigest = encrypt(password);
    const user = await ctx.orm.getRepository(User).findOne({ where: { email, passwordDigest } });

    if (user) {
      ctx.flash.set(i18next.t('flash.sessions.create.success'));
      ctx.session.userId = user.id;
      return ctx.redirect(router.url('root'));
    }

    ctx.flash.set(i18next.t('flash.sessions.create.error'));
    return ctx.render('sessions/new', { signInForm: { email } });
  });

  router.delete('/sessions', (ctx) => {
    ctx.session = {};
    return ctx.redirect(router.url('root'));
  });
};
