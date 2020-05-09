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
      status: 1,
      assignedTo: 1,
      tags: 'job, buy, fix',
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
      creator: { id: 1 },
      status: { name: 'new' },
      assignedTo: { id: 1 },
      tags: [{ name: 'job' }, { name: 'buy' }, { name: 'fix' }],
    });
  });

  it('should delete task', async () => {
    const { id } = fixtures.Task.task1;

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
