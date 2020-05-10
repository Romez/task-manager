import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import { createConnection } from 'typeorm';

import loadFixtures from './loadFixtures';
import getApp from '../server/app';
import ormconfig from '../ormconfig';

describe('test tasks', () => {
  let server;
  let connection;
  let authCookies;
  let fixtures;

  beforeAll(async () => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    connection = await createConnection(ormconfig[process.env.NODE_ENV]);
    fixtures = await loadFixtures(connection);
    server = getApp(connection).listen();

    const res = await request(server)
      .post('/sessions')
      .send({ email: 'user@mail.com', password: 'password' });

    authCookies = res.header['set-cookie'];
  });

  it('should show tasks page', async () => {
    const res = await request(server).get('/tasks');
    expect(res).toHaveHTTPStatus(200);
  });

  it('should create task', async () => {
    const payload = {
      name: 'Buy milk',
      description: '3.2%',
      status: fixtures.TaskStatus.taskStatusNew.id,
      assignedTo: fixtures.User.user.id,
      tags: [fixtures.Tag.job.name, fixtures.Tag.buy.name, 'fix'].join(', '),
    };

    const res = await request(server)
      .post('/tasks')
      .send(payload)
      .set({ cookie: authCookies });
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
      tags: [{ name: 'job' }, { name: 'buy' }, { name: 'fix' }],
    });
  });

  it('should show edit page', async () => {
    const { id } = fixtures.Task.buyMilkTask;

    const res = await request(server).get(`/tasks/${id}/edit`);
    expect(res).toHaveHTTPStatus(200);
  });

  it('should update task', async () => {
    const { id } = fixtures.Task.buyMilkTask;

    const payload = {
      name: 'buy meat',
      description: 'beaf 0.5 kg',
      status: fixtures.TaskStatus.taskStatusFinished.id,
      assignedTo: '',
      tags: [fixtures.Tag.buy.name, 'food'].join(','),
    };

    const res = await request(server)
      .patch(`/tasks/${id}`)
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
      tags: [fixtures.Tag.buy, { name: 'food' }],
    });
  });

  it('should delete task', async () => {
    const { id } = fixtures.Task.buyMilkTask;

    const res = await request(server).delete(`/tasks/${id}`);
    expect(res).toHaveHTTPStatus(302);

    const task = await connection.getRepository('Task').findOne({ id });
    expect(task).toBeFalsy();
  });

  afterEach(async () => {
    await connection.close();
    server.close();
  });
});
