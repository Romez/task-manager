import request from 'supertest';
import { createConnection } from 'typeorm';

import loadFixtures from './loadFixtures';
import getApp from '../server/app';
import ormconfig from '../ormconfig';

describe('test taskStatuses', () => {
  let server;
  let connection;
  let fixtures;
  let authenticatedCookies;

  beforeEach(async () => {
    connection = await createConnection(ormconfig[process.env.NODE_ENV]);
    fixtures = await loadFixtures(connection);
    server = getApp(connection).listen();

    const res = await request(server)
      .post('/sessions')
      .send({ email: 'user@mail.com', password: 'password' });

    authenticatedCookies = res.header['set-cookie'];
  });

  it('should show list of statuses', async () => {
    const res = await request(server)
      .get('/task-statuses')
      .set({ cookie: authenticatedCookies });
    expect(res).toHaveHTTPStatus(200);
  });

  it('should show new status form', async () => {
    const res = await request(server)
      .get('/task-statuses/new')
      .set({ cookie: authenticatedCookies });
    expect(res).toHaveHTTPStatus(200);
  });

  it('should create status', async () => {
    const payload = { name: 'inProgress', isDefault: 'on' };
    const res = await request(server)
      .post('/task-statuses')
      .set({ cookie: authenticatedCookies })
      .send(payload);

    const statusRepository = connection.getRepository('TaskStatus');

    const status = await statusRepository.findOne({ name: payload.name });
    expect(status).toMatchObject({ name: 'inProgress', isDefault: true });

    const prevDefaultStatus = await statusRepository.findOne(fixtures.TaskStatus.taskStatusNew.id);
    expect(prevDefaultStatus.isDefault).toBeFalsy();

    expect(res).toHaveHTTPStatus(302);
  });

  it('should show edit form', async () => {
    const res = await request(server)
      .get('/task-statuses/1/edit')
      .set({ cookie: authenticatedCookies });

    expect(res).toHaveHTTPStatus(200);
  });

  it('should update task status', async () => {
    const { id } = fixtures.TaskStatus.taskStatusFinished;

    const res = await request(server)
      .patch(`/task-statuses/${id}`)
      .set({ cookie: authenticatedCookies })
      .send({ name: 'testing', isDefault: 'on' });

    expect(res).toHaveHTTPStatus(302);

    const statusRepository = connection.getRepository('TaskStatus');

    const taskStatus = await statusRepository.findOneOrFail(id);
    expect(taskStatus).toMatchObject({ name: 'testing', isDefault: true });

    const prevDefaultStatus = await statusRepository.findOne(fixtures.TaskStatus.taskStatusNew.id);
    expect(prevDefaultStatus.isDefault).toBeFalsy();
  });

  it('should delete status', async () => {
    const res = await request(server)
      .post('/task-statuses/1')
      .set({ cookie: authenticatedCookies })
      .send({ _method: 'delete' });
    expect(res).toHaveHTTPStatus(302);

    const taskStatus = await connection.getRepository('TaskStatus').findOne({ name: 'new' });
    expect(taskStatus).toBeFalsy();
  });

  afterEach(async () => {
    await connection.close();
    server.close();
  });
});
