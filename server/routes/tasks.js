import { validate } from 'class-validator';
import _ from 'lodash';
import { In } from 'typeorm';
import i18next from 'i18next';
import * as paginate from 'koa-ctx-paginate';

import { TaskStatus, Task, User, Tag } from '../entity';

export default (router) => {
  router.get('tasks', '/tasks', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const where = {};

    if (ctx.query.status) {
      where.status = ctx.query.status;
    }

    if (ctx.query.assignedTo) {
      where.assignedTo = ctx.query.assignedTo;
    }

    if (ctx.query.myTasks) {
      where.creator = ctx.session.userId;
    }

    if (ctx.query.tags) {
      const tags = _.get(ctx.query, 'tags', '')
        .split(',')
        .map(_.trim)
        .filter((tag) => !_.isEmpty(tag));

      const existsTags = await ctx.orm.getRepository(Tag).find({ name: In(tags) });

      if (!_.isEmpty(existsTags)) {
        const tasksIds = _.uniq(_.flatMap(existsTags, (tag) => tag.taskIds));
        where.id = In(tasksIds);
      }
    }

    const taskRepository = ctx.orm.getRepository(Task);
    const [tasks, count] = await taskRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: ctx.paginate.skip,
      take: ctx.query.limit,
      relations: ['status', 'tags', 'creator', 'assignedTo'],
    });

    const filter = {
      status: { id: ctx.query.status },
      tags: ctx.query.tags,
      assignedTo: { id: ctx.query.assignedTo },
      myTasks: _.get(ctx.query, 'myTasks', false),
    };

    const pageCount = Math.ceil(count / ctx.query.limit);

    const statuses = await ctx.orm.getRepository(TaskStatus).find();
    const users = await ctx.orm.getRepository(User).find();

    return ctx.render('tasks', {
      tasks,
      pageCount,
      pages: paginate.getArrayPages(ctx)(3, pageCount, ctx.query.page),
      statuses: [{ id: null, name: '' }, ...statuses],
      filter,
      users: [{ id: null, name: '' }, ...users.map((user) => ({ id: user.id, name: user.toString() }))],
    });
  });

  router.get('newTask', '/tasks/new', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const statuses = await ctx.orm.getRepository(TaskStatus).find({ order: { isDefault: 'DESC' } });
    const users = await ctx.orm.getRepository(User).find();

    return ctx.render('tasks/new', {
      task: {},
      statuses,
      users: [{ id: null, name: '' }, ...users.map((user) => ({ id: user.id, name: user.toString() }))],
    });
  });

  router.get('showTask', '/tasks/:id', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const task = await ctx.orm.getRepository(Task).findOneOrFail(ctx.params.id, {
      relations: ['status', 'assignedTo', 'creator', 'tags'],
    });

    return ctx.render('tasks/show', { task });
  });

  router.get('editTask', '/tasks/:id/edit', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const task = await ctx.orm.getRepository(Task).findOneOrFail(ctx.params.id, {
      relations: ['status', 'assignedTo', 'creator', 'tags'],
    });
    const statuses = await ctx.orm.getRepository(TaskStatus).find();
    const users = await ctx.orm.getRepository(User).find();

    return ctx.render('tasks/edit', {
      task: { ...task, tags: task.tags.map(({ name }) => name).join(', ') },
      statuses,
      users: [{ id: null, name: '' }, ...users.map((user) => ({ id: user.id, name: user.toString() }))],
    });
  });

  router.post('createTask', '/tasks', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const taskRepository = ctx.orm.getRepository(Task);
    const userRepository = ctx.orm.getRepository(User);
    const tagsRespository = ctx.orm.getRepository(Tag);

    const { body } = ctx.request;

    const status = await statusRepository.findOneOrFail(body.status_id);
    const creator = await userRepository.findOneOrFail(ctx.session.userId);
    const assignedTo = body.assigned_to_id ? await userRepository.findOneOrFail(body.assigned_to_id) : null;
    const tags = body.tags
      .split(',')
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.trim());

    const existsTags = await tagsRespository.find({ where: { name: In(tags) }, order: { id: 'ASC' } });
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
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

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
    task.status = await statusRepository.findOneOrFail(body.status_id);
    task.assignedTo = body.assigned_to_id ? await userRepository.findOneOrFail(body.assigned_to_id) : null;
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
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(403);
    }

    const { id } = ctx.params;

    const taskRepository = ctx.orm.getRepository(Task);
    const task = await taskRepository.findOneOrFail({ id });

    await taskRepository.remove(task);

    ctx.flash.set(i18next.t('flash.tasks.delete.success'));

    return ctx.redirect(router.url('tasks'));
  });
};
