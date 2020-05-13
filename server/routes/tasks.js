import { validate } from 'class-validator';
import _ from 'lodash';
import { In } from 'typeorm';
import i18next from 'i18next';
import * as paginate from 'koa-ctx-paginate';

import { TaskStatus, Task, User, Tag } from '../entity';

export default (router) => {
  router.get('tasks', '/tasks', async (ctx) => {
    const [tasks, count] = await ctx.orm.getRepository(Task).findAndCount({
      relations: ['status', 'assignedTo', 'creator', 'tags'],
      skip: ctx.paginate.skip,
      take: ctx.query.limit,
    });

    const pageCount = Math.ceil(count / ctx.query.limit);

    return ctx.render('tasks', { tasks, pageCount, pages: paginate.getArrayPages(ctx)(3, pageCount, ctx.query.page) });
  });

  router.get('newTask', '/tasks/new', async (ctx) => {
    const statuses = await ctx.orm.getRepository(TaskStatus).find();
    const users = await ctx.orm.getRepository(User).find();

    await ctx.render('tasks/new', {
      task: {},
      statuses,
      users: [{ id: null, name: '' }, ...users.map(({ id, email }) => ({ id, name: email }))],
    });
  });

  router.get('editTask', '/tasks/:id/edit', async (ctx) => {
    const task = await ctx.orm.getRepository(Task).findOneOrFail(ctx.params.id, {
      relations: ['status', 'assignedTo', 'creator', 'tags'],
    });
    const statuses = await ctx.orm.getRepository(TaskStatus).find();
    const users = await ctx.orm.getRepository(User).find();

    return ctx.render('tasks/edit', {
      task: { ...task, tags: task.tags.map(({ name }) => name).join(', ') },
      statuses,
      users: [{ id: null, name: '' }, ...users.map(({ id, email }) => ({ id, name: email }))],
    });
  });

  router.post('createTask', '/tasks', async (ctx) => {
    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const taskRepository = ctx.orm.getRepository(Task);
    const userRepository = ctx.orm.getRepository(User);
    const tagsRespository = ctx.orm.getRepository(Tag);

    const { body } = ctx.request;

    const status = await statusRepository.findOneOrFail(body.status);
    const creator = await userRepository.findOneOrFail(ctx.session.userId);
    const assignedTo = body.assignedTo ? await userRepository.findOneOrFail(body.assignedTo) : null;
    const tags = body.tags
      .split(',')
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.trim());

    const existsTags = await tagsRespository.find({ name: In(tags) });
    const missedTags = await tagsRespository.save(
      _.differenceBy(
        tags.map((name) => ({ name })),
        existsTags,
        'name',
      ),
    );

    const task = await taskRepository.create({
      name: body.name,
      description: body.description,
      creator,
      status,
      assignedTo,
      tags: [...existsTags, ...missedTags],
    });
    const errors = await validate(task);

    if (!_.isEmpty(errors)) {
      const statuses = await ctx.orm.getRepository(TaskStatus).find();
      const users = await ctx.orm.getRepository(User).find();

      return ctx.render('tasks/new', {
        task: body,
        statuses,
        users: [{ id: null, name: '' }, ...users.map(({ id, email }) => ({ id, name: email }))],
      });
    }

    await taskRepository.save(task);
    ctx.flash.set(i18next.t('flash.tasks.create.success'));

    return ctx.redirect(router.url('tasks'));
  });

  router.patch('updateTask', '/tasks/:id', async (ctx) => {
    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const taskRepository = ctx.orm.getRepository(Task);
    const userRepository = ctx.orm.getRepository(User);
    const tagsRespository = ctx.orm.getRepository(Tag);

    const { body } = ctx.request;

    const tags = body.tags
      .split(',')
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.trim());

    const existsTags = await tagsRespository.find({ name: In(tags) });
    const missedTags = await tagsRespository.save(
      _.differenceBy(
        tags.map((name) => ({ name })),
        existsTags,
        'name',
      ),
    );

    const task = await taskRepository.findOneOrFail(ctx.params.id);
    task.name = body.name;
    task.description = body.description;
    task.status = await statusRepository.findOneOrFail(body.status);
    task.assignedTo = body.assignedTo ? await userRepository.findOneOrFail(body.assignedTo) : null;
    task.tags = [...existsTags, ...missedTags];

    const errors = await validate(task);
    if (!_.isEmpty(errors)) {
      const statuses = await statusRepository.find();
      const users = await userRepository.find();

      return ctx.render('tasks/edit', {
        task: { ...task, tags: task.tags.map(({ name }) => name).join(', ') },
        statuses,
        users: [{ id: null, name: '' }, ...users.map(({ id, email }) => ({ id, name: email }))],
        errors,
      });
    }

    await taskRepository.save(task);

    ctx.flash.set(i18next.t('flash.tasks.update.success'));
    return ctx.redirect(router.url('editTask', { id: ctx.params.id }));
  });

  router.delete('deleteTask', '/tasks/:id', async (ctx) => {
    const { id } = ctx.params;

    const taskRepository = ctx.orm.getRepository(Task);
    const task = await taskRepository.findOneOrFail({ id });

    await taskRepository.remove(task);

    ctx.flash.set(i18next.t('flash.tasks.delete.success'));

    return ctx.redirect(router.url('tasks'));
  });
};
