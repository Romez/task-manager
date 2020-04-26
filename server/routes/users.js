import { validate } from 'class-validator';
import _ from 'lodash';
import i18next from 'i18next';

import encrypt from '../lib/secure';
import { User } from '../entity';

export default (router) => {
  router.get('newUser', '/users/new', (ctx) => {
    const user = new User();
    return ctx.render('users/new', { user });
  });

  router.get('users', '/users', async (ctx) => {
    const users = await ctx.orm.getRepository(User).find();
    await ctx.render('users', { users });
  });

  router.get('editUser', '/users/:id/edit', async (ctx) => {
    const { id } = ctx.params;
    const user = await ctx.orm.getRepository(User).findOne({ id });

    await ctx.render('users/edit', { user });
  });

  router.post('createUser', '/users', async (ctx) => {
    const { body } = ctx.request;
    const userRepository = ctx.orm.getRepository(User);

    const user = await userRepository.create({
      ...body,
      passwordDigest: encrypt(body.password),
    });
    const errors = await validate(user);

    if (!_.isEmpty(errors)) {
      return ctx.render('users/new', { user: body, errors });
    }

    await userRepository.save(user);
    ctx.flash.set(i18next.t('flash.users.create.success'));

    return ctx.redirect(router.url('users'));
  });

  router.patch('updateUser', '/users/:id', async (ctx) => {
    const { id } = ctx.params;
    const userRepository = ctx.orm.getRepository(User);
    const userBefore = await userRepository.findOne(id);
    const userAfter = userRepository.merge(userBefore, ctx.request.body);

    if (!ctx.state.isSignedIn() || userBefore.id !== ctx.session.userId) {
      ctx.throw(404);
    }

    const errors = await validate(userAfter);
    if (!_.isEmpty(errors)) {
      await ctx.render(router.url('editUser', { id: 1 }), { user: userBefore, errors });
    }

    await userRepository.save(userAfter);
    ctx.redirect(router.url('editUser', { id: 1 }));
  });
};
