import { validate } from 'class-validator';
import _ from 'lodash';
import i18next from 'i18next';
import * as paginate from 'koa-ctx-paginate';

import encrypt from '../lib/secure';
import { User } from '../entity';

export default (router) => {
  router.get('newUser', '/users/new', (ctx) => {
    const user = new User();
    return ctx.render('users/new', { user });
  });

  router.get('users', '/users', async (ctx) => {
    const [users, count] = await ctx.orm.getRepository(User).findAndCount({
      skip: ctx.paginate.skip,
      take: ctx.query.limit,
    });

    const pageCount = Math.ceil(count / ctx.query.limit);

    await ctx.render('users', {
      users,
      pageCount,
      pages: paginate.getArrayPages(ctx)(3, pageCount, ctx.query.page),
    });
  });

  router.get('editUser', '/users/:id/edit', async (ctx) => {
    const { id } = ctx.params;
    const user = await ctx.orm.getRepository(User).findOne({ id });

    if (ctx.state.currentUser.isGuest || user.id !== ctx.session.userId) {
      ctx.throw(403);
    }

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

    const userBefore = await userRepository.findOneOrFail({ id });
    if (userBefore.id !== ctx.session.userId) {
      ctx.throw(403);
    }

    const userAfter = userRepository.merge(userBefore, ctx.request.body);

    const errors = await validate(userAfter);
    if (!_.isEmpty(errors)) {
      await ctx.render(router.url('editUser', { id }), { user: userBefore, errors });
    }

    await userRepository.save(userAfter);
    ctx.flash.set(i18next.t('flash.users.update.success'));
    ctx.redirect(router.url('editUser', { id }));
  });

  router.delete('deleteUser', '/users/:id', async (ctx) => {
    const { id } = ctx.params;
    const userRepository = ctx.orm.getRepository(User);
    const user = await userRepository.findOneOrFail({ id }, { relations: ['tasks'] });

    if (ctx.state.currentUser.isGuest || user.id !== ctx.session.userId) {
      ctx.throw(403);
    }

    if (!_.isEmpty(user.tasks)) {
      ctx.flash.set(i18next.t('flash.users.delete.hasTasks'));
      return ctx.redirect(router.url('users'));
    }

    await userRepository.remove(user);
    ctx.session = {};

    return ctx.redirect(router.url('users'));
  });
};
