import request from 'supertest';
import { createConnection } from 'typeorm';

import loadFixtures from './loadFixtures';
import getApp from '../server/app';

describe('test tasks', () => {
  let server;
  let connection;
  let authenticatedCookies;

  beforeEach(async () => {
    connection = await createConnection(process.env.NODE_ENV);
    await loadFixtures(connection);
    server = getApp({ connection }).listen();

    const res = await request(server)
      .post('/sessions')
      .send({ email: 'petya@mail.com', password: 'password' });

    authenticatedCookies = res.header['set-cookie'];
  });

  it('should open chat page', async () => {
    const res = await request(server)
      .get('/chat')
      .set({ cookie: authenticatedCookies });
    expect(res).toHaveHTTPStatus(200);
  });

  afterEach(async () => {
    await connection.close();
    server.close();
  });
});
