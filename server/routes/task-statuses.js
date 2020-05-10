import { validate } from 'class-validator';
import _ from 'lodash';
import i18next from 'i18next';

import { TaskStatus } from '../entity';

export default (router) => {
  router.get('taskStatuses', '/task-statuses', async (ctx) => {
    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const taskStatuses = await statusRepository.find();

    await ctx.render('task-statuses/index', { taskStatuses });
  });

  router.get('newTaskStatus', '/task-statuses/new', async (ctx) => {
    await ctx.render('task-statuses/new', { taskStatus: {} });
  });

  router.get('editTaskStatus', '/task-statuses/:id/edit', async (ctx) => {
    const { id } = ctx.params;
    const taskStatus = await ctx.orm.getRepository(TaskStatus).findOneOrFail({ id });
    return ctx.render('task-statuses/edit', { taskStatus });
  });

  router.post('createTaskStatus', '/task-statuses', async (ctx) => {
    const statusRepository = ctx.orm.getRepository(TaskStatus);

    const status = await statusRepository.create(ctx.request.body);
    const errors = await validate(status);

    if (!_.isEmpty(errors)) {
      const { name } = ctx.request.body;
      return ctx.render('task-statuses/new', { taskStatus: { name }, errors });
    }

    await statusRepository.save(status);
    ctx.flash.set(i18next.t('flash.taskStatuses.create.success'));

    return ctx.redirect(router.url('taskStatuses'));
  });

  router.patch('updateTaskStatus', '/task-statuses/:id', async (ctx) => {
    const { id } = ctx.params;
    const statusRepository = ctx.orm.getRepository(TaskStatus);

    const taskStatusBefore = await statusRepository.findOneOrFail(id);
    const taskStatusAfter = statusRepository.merge(taskStatusBefore, ctx.request.body);

    const errors = await validate(taskStatusAfter);
    console.log({ errors: errors[0] });

    if (!_.isEmpty(errors)) {
      return ctx.render('task-statuses/edit', { taskStatus: taskStatusAfter, errors });
    }

    await statusRepository.save(taskStatusAfter);
    ctx.flash.set(i18next.t('flash.taskStatuses.update.success'));
    return ctx.redirect(router.url('editTaskStatus', { id }));
  });

  router.delete('removeTaskStatus', '/task-statuses/:id', async (ctx) => {
    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const { id } = ctx.params;

    const status = await statusRepository.findOneOrFail({ id });

    await statusRepository.softRemove(status);

    ctx.flash.set(i18next.t('flash.taskStatuses.delete.success', { name: status.name }));
    return ctx.redirect(router.url('taskStatuses'));
  });
};
