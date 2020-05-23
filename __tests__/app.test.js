import request from 'supertest';

import app from '../server/app';

describe('test arequestpp', () => {
  let server;

  beforeEach(() => {
    server = app().listen();
  });

  it('should runrequest app', async () => {
    const res = await request(server).get('/');

    expect(res).toHaveHTTPStatus(200);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
