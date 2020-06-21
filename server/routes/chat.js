import _ from 'lodash';
import { validate } from 'class-validator';

import userAuth from '../middlewares/userAuth';
import { ChatChannel, ChatMessage, User } from '../entity';
import { chatEvents } from '../../constants';

export default (router, io) => {
  router.get('chat', '/chat', async (ctx) => {
    const channels = await ctx.orm.getRepository(ChatChannel).find();
    const messages = await ctx.orm.getRepository(ChatMessage).find();
    const users = await ctx.orm.getRepository(User).find({
      select: ['id', 'email', 'firstName', 'lastName'],
    });

    return ctx.render('chat', {
      gon: {
        user: _.omit(ctx.state.currentUser, ['passwordDigest']),
        channels,
        currentChannelId: 1,
        messages,
        users,
      },
    });
  });

  router.post('createChatChannel', '/api/v1/channels', userAuth, async (ctx) => {
    const chatChannelRepo = ctx.orm.getRepository(ChatChannel);

    const name = _.get(ctx, ['request', 'body', 'data', 'attributes', 'name']);

    const channel = await chatChannelRepo.create({ name, removable: true });
    const errors = await validate(channel);

    if (!_.isEmpty(errors)) {
      ctx.status = 422;
      ctx.body = { errors };
      return;
    }

    await chatChannelRepo.save(channel);

    const data = { data: { type: 'channels', id: channel.id, attributes: channel } };
    io.broadcast(chatEvents.newChannel, data);

    ctx.status = 201;
    ctx.body = data;
  });

  router.delete('deleteChatChannel', '/api/v1/channels/:id', userAuth, async (ctx) => {
    const { id } = ctx.params;
    const chatChannelRepo = ctx.orm.getRepository(ChatChannel);
    const chatChannel = await chatChannelRepo.findOneOrFail({ id });

    await chatChannelRepo.remove(chatChannel);

    const data = { data: { type: 'channels', id: Number(id) } };

    io.broadcast(chatEvents.removeChannel, data);

    ctx.status = 204;
  });

  router.patch('renameChatChannel', '/api/v1/channels/:id', userAuth, async (ctx) => {
    const { id } = ctx.params;
    const chatChannelRepo = ctx.orm.getRepository(ChatChannel);
    const channelBefore = await chatChannelRepo.findOneOrFail({ id });
    const channelAfter = chatChannelRepo.merge(channelBefore, ctx.request.body.data.attributes);

    const errors = await validate(channelAfter);
    if (!_.isEmpty(errors)) {
      ctx.status = 422;
      ctx.body = { errors };
      return;
    }

    await chatChannelRepo.save(channelAfter);

    const data = {
      data: {
        attributes: {
          id: Number(id),
          name: channelAfter.name,
        },
      },
    };

    io.broadcast(chatEvents.renameChannel, data);

    ctx.status = 200;
  });

  router.post('createChatMessage', '/api/v1/channels/:channelId/messages', userAuth, async (ctx) => {
    const { channelId } = ctx.params;
    const chatMessageRepo = ctx.orm.getRepository(ChatMessage);

    const body = _.get(ctx, ['request', 'body', 'data', 'attributes', 'body']);
    const channel = await ctx.orm.getRepository(ChatChannel).findOneOrFail({ id: channelId });
    const user = ctx.state.currentUser;

    const message = await chatMessageRepo.create({ user, channel, body });

    const errors = await validate(channel);
    if (!_.isEmpty(errors)) {
      ctx.status = 422;
      ctx.body = { errors };
      return;
    }

    await chatMessageRepo.save(message);

    const data = {
      data: {
        type: 'messages',
        id: message.id,
        attributes: _.omit(message, ['channel', 'user']),
        relationships: {
          user: {
            data: {
              id: user.id,
              attributes: _.omit(user, 'passwordDigest'),
            },
          },
        },
      },
    };

    ctx.status = 201;
    ctx.body = data;

    io.broadcast(chatEvents.newMessage, data);
  });
};
