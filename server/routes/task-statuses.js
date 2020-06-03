import { validate } from 'class-validator';
import _ from 'lodash';
import i18next from 'i18next';

import { TaskStatus } from '../entity';

export default (router) => {
  router.get('taskStatuses', '/task-statuses', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const taskStatuses = await statusRepository.find({ order: { isDefault: 'DESC' } });

    return ctx.render('task-statuses/index', { taskStatuses });
  });

  router.get('newTaskStatus', '/task-statuses/new', (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    return ctx.render('task-statuses/new', { taskStatus: { isDefault: false } });
  });

  router.get('editTaskStatus', '/task-statuses/:id/edit', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const { id } = ctx.params;
    const taskStatus = await ctx.orm.getRepository(TaskStatus).findOneOrFail({ id });
    return ctx.render('task-statuses/edit', { taskStatus });
  });

  router.post('createTaskStatus', '/task-statuses', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const { body } = ctx.request;

    const status = await statusRepository.create({ name: body.name, isDefault: !!body.isDefault });
    const errors = await validate(status);

    if (!_.isEmpty(errors)) {
      const { name } = body;
      return ctx.render('task-statuses/new', { taskStatus: { name }, errors });
    }

    if (status.isDefault) {
      await statusRepository.update({ isDefault: true }, { isDefault: false });
    }

    await statusRepository.save(status);
    ctx.flash.set(i18next.t('flash.taskStatuses.create.success'));

    return ctx.redirect(router.url('taskStatuses'));
  });

  router.patch('updateTaskStatus', '/task-statuses/:id', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const { id } = ctx.params;
    const { body } = ctx.request;
    const statusRepository = ctx.orm.getRepository(TaskStatus);

    const taskStatusBefore = await statusRepository.findOneOrFail(id);
    const taskStatusAfter = statusRepository.merge(taskStatusBefore, {
      name: body.name,
      isDefault: !!body.isDefault,
    });

    const errors = await validate(taskStatusAfter);

    if (!_.isEmpty(errors)) {
      return ctx.render('task-statuses/edit', { taskStatus: taskStatusAfter, errors });
    }

    if (taskStatusAfter.isDefault) {
      await statusRepository.update({ isDefault: true }, { isDefault: false });
    }

    await statusRepository.save(taskStatusAfter);
    ctx.flash.set(i18next.t('flash.taskStatuses.update.success'));
    return ctx.redirect(router.url('editTaskStatus', { id }));
  });

  router.delete('removeTaskStatus', '/task-statuses/:id', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const { id } = ctx.params;

    const status = await statusRepository.findOneOrFail({ id }, { relations: ['tasks'] });

    if (!_.isEmpty(status.tasks)) {
      ctx.flash.set(i18next.t('flash.taskStatuses.delete.hasTasks'));
      return ctx.redirect(router.url('taskStatuses'));
    }

    await statusRepository.remove(status);

    ctx.flash.set(i18next.t('flash.taskStatuses.delete.success', { name: status.name }));
    return ctx.redirect(router.url('taskStatuses'));
  });
};
