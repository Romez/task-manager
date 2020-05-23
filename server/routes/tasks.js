import { validate } from 'class-validator';
import _ from 'lodash';
import { In } from 'typeorm';
import i18next from 'i18next';
import * as paginate from 'koa-ctx-paginate';

import { TaskStatus, Task, User, Tag } from '../entity';

export default (router) => {
  router.get('tasks', '/tasks', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(404);
    }

    const qb = ctx.orm
      .getRepository(Task)
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.status', 'statuses')
      .leftJoinAndSelect('task.creator', 'users')
      .leftJoinAndSelect('task.assignedTo', 'User')
      .leftJoinAndSelect('task.tags', 'tags')
      .orderBy('task.id', 'DESC')
      .skip(ctx.paginate.skip)
      .take(ctx.query.limit);

    const conditions = {};
    if (ctx.query.status) {
      conditions.status = ctx.query.status;
    }

    if (ctx.query.assignedTo) {
      conditions.assignedTo = ctx.query.assignedTo;
    }

    if (ctx.query.myTasks) {
      conditions.creator = ctx.session.userId;
    }

    qb.where(conditions);

    if (ctx.query.tags) {
      const tags = _.get(ctx.query, 'tags', '')
        .split(',')
        .filter((tag) => tag.length > 0)
        .map(_.trim);
      qb.andWhere('tags.name IN(:...names)', { names: tags });
    }

    const [tasks, count] = await qb.getManyAndCount();

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
      return ctx.throw(404);
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
      return ctx.throw(404);
    }

    const task = await ctx.orm.getRepository(Task).findOneOrFail(ctx.params.id, {
      relations: ['status', 'assignedTo', 'creator', 'tags'],
    });

    return ctx.render('tasks/show', { task });
  });

  router.get('editTask', '/tasks/:id/edit', async (ctx) => {
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(404);
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
      return ctx.throw(404);
    }

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
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(404);
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
    if (ctx.state.currentUser.isGuest) {
      return ctx.throw(404);
    }

    const { id } = ctx.params;

    const taskRepository = ctx.orm.getRepository(Task);
    const task = await taskRepository.findOneOrFail({ id });

    await taskRepository.remove(task);

    ctx.flash.set(i18next.t('flash.tasks.delete.success'));

    return ctx.redirect(router.url('tasks'));
  });
};
