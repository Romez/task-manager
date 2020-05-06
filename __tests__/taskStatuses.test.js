import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import { createConnection } from 'typeorm';
// import faker from 'faker';

import loadFixtures from './loadFixtures';
import getApp from '../server/app';
import ormconfig from '../ormconfig';

describe('test taskStatuses', () => {
  let server;
  let connection;
  // let authCookies;

  beforeAll(async () => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    connection = await createConnection(ormconfig[process.env.NODE_ENV]);
    await loadFixtures(connection);
    server = getApp(connection).listen();

    // const res = await request(server)
    //   .post('/sessions')
    //   .send({ email: 'user@mail.com', password: 'password' });

    // authCookies = res.header['set-cookie'];
  });

  it('should show list of statuses', async () => {
    const res = await request(server).get('/task-statuses');
    expect(res).toHaveHTTPStatus(200);
  });

  it('should show new status form', async () => {
    const res = await request(server).get('/task-statuses/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('should create status', async () => {
    const payload = { name: 'inProgress' };
    const res = await request(server)
      .post('/task-statuses')
      .send(payload);

    const status = await connection.getRepository('TaskStatus').findOne({ name: payload.name });
    expect(status).toBeTruthy();

    expect(res).toHaveHTTPStatus(302);
  });

  it('should show edit form', async () => {
    const res = await request(server).get('/task-statuses/1/edit');
    expect(res).toHaveHTTPStatus(200);
  });

  it('should update task status', async () => {
    const res = await request(server)
      .patch('/task-statuses/1')
      .send({ name: 'finished' });
    expect(res).toHaveHTTPStatus(302);

    const taskStatus = await connection.getRepository('TaskStatus').findOneOrFail({ id: 1 });
    expect(taskStatus.name).toBe('finished');
  });

  it('should delete status', async () => {
    const res = await request(server)
      .post('/task-statuses/1')
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
