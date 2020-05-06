import { validate } from 'class-validator';
import _ from 'lodash';
import { In } from 'typeorm';

import { TaskStatus, Task, User, Tag } from '../entity';

export default (router) => {
  router.get('tasks', '/tasks', async (ctx) => {
    const tasks = await ctx.orm.getRepository(Task).find();
    return ctx.render('tasks', { tasks });
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

  router.post('createTask', '/tasks', async (ctx) => {
    const statusRepository = ctx.orm.getRepository(TaskStatus);
    const taskRepository = ctx.orm.getRepository(Task);
    const userRepository = ctx.orm.getRepository(User);
    const tagsRespository = ctx.orm.getRepository(Tag);

    const { body } = ctx.request;

    const status = await statusRepository.findOneOrFail(body.status);
    const creator = await userRepository.findOneOrFail(ctx.session.userId);
    const assignedTo = body.assignedTo ? await userRepository.findOneOrFail({ id: body.assignedTo }) : null;
    const tags = body.tags.split(',').map((tag) => tag.trim());

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
      throw new Error(errors);
    }

    await taskRepository.save(task);

    return ctx.redirect(router.url('root'));
  });
};
