import request from 'supertest';

import createApp from '../server/app';

describe('test arequestpp', () => {
  const app = createApp().listen();

  it('should runrequest app', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
  });

  app.close();
});
