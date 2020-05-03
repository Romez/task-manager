import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import { createConnection } from 'typeorm';
import faker from 'faker';

import loadFixtures from './loadFixtures';
import getApp from '../server/app';
import ormconfig from '../ormconfig';

describe('test users', () => {
  let server;
  let connection;
  let authCookies;

  beforeAll(async () => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    connection = await createConnection(ormconfig[process.env.NODE_ENV]);
    await loadFixtures(connection);
    server = getApp(connection).listen();

    const res = await request(server)
      .post('/sessions')
      .send({ email: 'user@mail.com', password: 'password' });

    authCookies = res.header['set-cookie'];
  });

  it('should show new user', async () => {
    const res = await request(server).get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('should show users', async () => {
    const res = await request(server).get('/users');
    expect(res).toHaveHTTPStatus(200);
  });

  it('should show edit user form', async () => {
    const res = await request(server).get('/users/1/edit').set({ cookie: authCookies });
    expect(res).toHaveHTTPStatus(200);
  });

  it('should create user', async () => {
    const payload = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const res = await request(server)
      .post('/users')
      .send(payload);

    const user = await connection.getRepository('User').findOne({ email: payload.email });
    expect(user).toMatchObject({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
    });

    expect(res).toHaveHTTPStatus(302);
  });

  it('should update user', async () => {
    const res = await request(server).post('/users/1').send({
      _method: 'patch',
      firstName: 'Ted',
    }).set({ cookie: authCookies });

    const user = await connection.getRepository('User').findOne({ id: 1 });
    expect(user.firstName).toBe('Ted');

    expect(res).toHaveHTTPStatus(302);
  });

  it('should remove user', async () => {
    const res = await request(server)
      .post('/users/1')
      .send({ _method: 'delete' })
      .set({ cookie: authCookies });

    const user = await connection.getRepository('User').findOne({ id: 1 });
    expect(user).toBeFalsy();

    expect(res).toHaveHTTPStatus(302);
  });

  afterEach(async () => {
    await connection.close();
    server.close();
  });
});
