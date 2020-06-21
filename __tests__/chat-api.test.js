import request from 'supertest';
import { createConnection } from 'typeorm';
import IO from 'koa-socket-2';
import path from 'path';

import loadFixtures from './loadFixtures';
import getApp from '../server/app';
import { chatEvents } from '../constants';

jest.mock('koa-socket-2');

const buildUrl = (url) => path.join('/api/v1/', url);

describe('test tasks', () => {
  let server;
  let connection;
  let io;
  let authenticatedCookies;
  let fixtures;

  beforeEach(async () => {
    connection = await createConnection(process.env.NODE_ENV);
    fixtures = await loadFixtures(connection);
    io = new IO();
    server = getApp({ connection, io }).listen();

    const res = await request(server)
      .post('/sessions')
      .send({ email: fixtures.User.petya.email, password: 'password' });

    authenticatedCookies = res.header['set-cookie'];
  });

  it('should create new chat channel', async () => {
    const payload = {
      data: {
        attributes: {
          name: 'custom',
        },
      },
    };

    const res = await request(server)
      .post(buildUrl('channels'))
      .set({ cookie: authenticatedCookies })
      .send(payload);

    expect(res).toHaveHTTPStatus(201);

    expect(res.body).toMatchObject({
      data: {
        type: 'channels',
        attributes: { name: 'custom', removable: true },
      },
    });

    expect(io.broadcast).toHaveBeenCalledWith(chatEvents.newChannel, res.body);
  });

  it('should delete channel', async () => {
    const { id } = fixtures.ChatChannel.custom;

    const res = await request(server)
      .delete(buildUrl(`channels/${id}`))
      .set({ cookie: authenticatedCookies });

    expect(res).toHaveHTTPStatus(204);

    const chatChannel = await connection.getRepository('ChatChannel').findOne(id);
    expect(chatChannel).toBeFalsy();

    expect(io.broadcast).toHaveBeenCalledWith(chatEvents.removeChannel, {
      data: {
        type: 'channels',
        id,
      },
    });
  });

  it('should rename channel', async () => {
    const { id } = fixtures.ChatChannel.custom;

    const payload = {
      data: {
        attributes: {
          name: 'zazaza',
        },
      },
    };

    const res = await request(server)
      .patch(buildUrl(`channels/${id}`))
      .set({ cookie: authenticatedCookies })
      .send(payload);

    expect(res).toHaveHTTPStatus(200);

    const chatChannel = await connection.getRepository('ChatChannel').findOne(id);
    expect(chatChannel.name).toBe('zazaza');

    expect(io.broadcast).toHaveBeenCalledWith(chatEvents.renameChannel, {
      data: {
        attributes: {
          id,
          name: 'zazaza',
        },
      },
    });
  });

  it('should add message', async () => {
    const channelId = fixtures.ChatChannel.custom.id;

    const payload = { data: { attributes: { body: 'egegey' } } };

    const res = await request(server)
      .post(buildUrl(`channels/${channelId}/messages`))
      .set({ cookie: authenticatedCookies })
      .send(payload);

    expect(res).toHaveHTTPStatus(201);

    expect(res.body).toMatchObject({
      data: {
        type: 'messages',
        id: res.body.data.id,
        attributes: { body: payload.data.attributes.body },
        relationships: {
          user: {
            data: {
              id: fixtures.User.petya.id,
              attributes: {
                email: fixtures.User.petya.email,
                firstName: fixtures.User.petya.firstName,
                lastName: fixtures.User.petya.lastName,
              },
            },
          },
        },
      },
    });

    expect(io.broadcast).toHaveBeenCalledWith(chatEvents.newMessage, res.body);
  });

  afterEach(async () => {
    await connection.close();
    server.close();
  });
});
