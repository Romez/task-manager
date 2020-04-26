import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../server/app';

describe('test arequestpp', () => {
  let server;

  beforeAll(() => {
    expect.extend(matchers);
  });

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
