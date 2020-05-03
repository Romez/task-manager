import path from 'path';
import Koa from 'koa';
import * as Sentry from '@sentry/node';
import Pug from 'koa-pug';
import Router from 'koa-router';
import serve from 'koa-static';
import koaWebpack from 'koa-webpack';
import methodOverride from 'koa-methodoverride';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import koaLogger from 'koa-logger';
import i18next from 'i18next';
import _ from 'lodash';
import errorHandler from 'koa-better-error-handler';
import koa404Handler from 'koa-404-handler';

import config from '../webpack.config';
import addRoutes from './routes';
import en from './locales/en';
import { User, Guest } from './entity';

const setupLocalization = () => {
  i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en },
  });
};

const createApp = (connection) => {
  const app = new Koa();

  app.context.onerror = errorHandler;
  app.use(koa404Handler);

  const router = new Router();
  app.use(koaLogger());

  Sentry.init({ dsn: process.env.SENTRY });

  app.use(async (_ctx, next) => {
    try {
      await next();
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  });

  app.context.orm = connection;

  app.keys = ['some secret hurr'];
  app.use(session(app));
  app.use(flash());
  app.use(async (ctx, next) => {
    let currentUser;

    if (ctx.session.userId) {
      currentUser = await ctx.orm.getRepository(User).findOne({ id: ctx.session.userId });
    } else {
      currentUser = new Guest();
    }

    ctx.state = { flash: ctx.flash, currentUser };

    await next();
  });
  app.use(bodyParser());
  app.use(methodOverride((req) => {
    // return req?.body?._method;
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));

  if (process.env.NODE_ENV === 'development') {
    koaWebpack({ config }).then((m) => app.use(m));
  }

  setupLocalization();

  app.use(serve(path.join(__dirname, '..', 'dist')));

  addRoutes(router);

  router.get('/check/error', () => {
    throw new Error('Check error');
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  const pug = new Pug({
    viewPath: path.join(__dirname, '..', 'views'),
    noCache: process.env.NODE_ENV === 'development',
    basedir: path.join(__dirname, '..', 'views'),
    locals: [],
    helperPath: [{
      urlFor: (...args) => router.url(...args),
      t: (key, params) => i18next.t(key, params),
      _,
    }],
  });

  pug.use(app);

  return app;
};

export default createApp;
