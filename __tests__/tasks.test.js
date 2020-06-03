import request from 'supertest';
import { createConnection } from 'typeorm';

import loadFixtures from './loadFixtures';
import getApp from '../server/app';

describe('test tasks', () => {
  let server;
  let connection;
  let authenticatedCookies;
  let fixtures;

  beforeEach(async () => {
    connection = await createConnection(process.env.NODE_ENV);
    fixtures = await loadFixtures(connection);
    server = getApp(connection).listen();

    const res = await request(server)
      .post('/sessions')
      .send({ email: 'user@mail.com', password: 'password' });

    authenticatedCookies = res.header['set-cookie'];
  });

  it('should show tasks page', async () => {
    const res = await request(server)
      .get('/tasks')
      .set({ cookie: authenticatedCookies });
    expect(res).toHaveHTTPStatus(200);
  });

  it('should open task view page', async () => {
    const res = await request(server)
      .get(`/tasks/${fixtures.Task.buyMilkTask.id}`)
      .set({ cookie: authenticatedCookies });

    expect(res).toHaveHTTPStatus(200);
  });

  it('should create task', async () => {
    const payload = {
      name: 'Buy milk',
      description: '3.2%',
      status_id: fixtures.TaskStatus.taskStatusNew.id,
      assigned_to_id: fixtures.User.user.id,
      tags: [fixtures.Tag.job.name, 'fix'].join(', '),
    };

    const res = await request(server)
      .post('/tasks')
      .send(payload)
      .set({ cookie: authenticatedCookies });
    expect(res).toHaveHTTPStatus(302);

    const task = await connection
      .getRepository('Task')
      .findOneOrFail({ name: payload.name }, { relations: ['status', 'creator', 'assignedTo', 'tags'] });

    expect(task).toMatchObject({
      name: payload.name,
      description: payload.description,
      creator: fixtures.User.user,
      status: fixtures.TaskStatus.taskStatusNew,
      assignedTo: fixtures.User.user,
      tags: [{ name: 'job' }, { name: 'fix' }],
    });
  });

  it('should show edit page', async () => {
    const { id } = fixtures.Task.buyMilkTask;

    const res = await request(server)
      .get(`/tasks/${id}/edit`)
      .set({ cookie: authenticatedCookies });
    expect(res).toHaveHTTPStatus(200);
  });

  it('should update task', async () => {
    const { id } = fixtures.Task.buyMilkTask;

    const payload = {
      name: 'buy meat',
      description: 'beaf 0.5 kg',
      status_id: fixtures.TaskStatus.taskStatusFinished.id,
      assigned_to_id: '',
      tags: [fixtures.Tag.buy.name, 'food'].join(','),
    };

    const res = await request(server)
      .patch(`/tasks/${id}`)
      .set({ cookie: authenticatedCookies })
      .send(payload);
    expect(res).toHaveHTTPStatus(302);

    const task = await connection
      .getRepository('Task')
      .findOneOrFail({ id }, { relations: ['status', 'creator', 'assignedTo', 'tags'] });

    expect(task).toMatchObject({
      name: payload.name,
      description: payload.description,
      creator: fixtures.User.user,
      status: fixtures.TaskStatus.taskStatusFinished,
      assignedTo: null,
      tags: [{ name: fixtures.Tag.buy.name }, { name: 'food' }],
    });
  });

  it('should delete task', async () => {
    const { id } = fixtures.Task.buyMilkTask;

    const res = await request(server)
      .delete(`/tasks/${id}`)
      .set({ cookie: authenticatedCookies });

    expect(res).toHaveHTTPStatus(302);

    const task = await connection.getRepository('Task').findOne({ id });
    expect(task).toBeFalsy();
  });

  afterEach(async () => {
    await connection.close();
    server.close();
  });
});
