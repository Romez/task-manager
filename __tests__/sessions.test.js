import request from 'supertest';
import { createConnection } from 'typeorm';

import loadFixtures from './loadFixtures';
import getApp from '../server/app';

describe('test session', () => {
  let app;
  let server;
  let connection;

  beforeEach(async () => {
    connection = await createConnection(process.env.NODE_ENV);
    await loadFixtures(connection);

    app = getApp(connection);
    server = app.listen();
  });

  it('should show signIn form', async () => {
    const res = await request(server).get('/sessions/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('should signIn', async () => {
    const payload = { email: 'petya@mail.com', password: 'password' };
    const res = await request(server)
      .post('/sessions')
      .send(payload);

    expect(res.statusCode).toBe(302);
  });

  it('shoud signOut', async () => {
    const res = await request(server).delete('/sessions');

    expect(res.statusCode).toBe(302);
  });

  afterEach(async () => {
    await connection.close();
    server.close();
  });
});
