import path from 'path';
import Koa from 'koa';
import * as Sentry from '@sentry/node';
import Pug from 'koa-pug';
import Router from 'koa-router';
import serve from 'koa-static';
import koaWebpack from 'koa-webpack';
import config from '../webpack.config';

const createApp = () => {
  const app = new Koa();
  const router = new Router();

  Sentry.init({ dsn: process.env.SENTRY });

  app.use(async (_ctx, next) => {
    try {
      await next();
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  });

  if (process.env.NODE_ENV === 'development') {
    koaWebpack({ config }).then((m) => app.use(m));
  }

  app.use(serve(path.join(__dirname, '..', 'dist')));

  router.get('/', (ctx) => ctx.render('welcome/index'));

  router.get('/check/error', () => {
    throw new Error('Check error');
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  const pug = new Pug({
    viewPath: path.join(__dirname, '..', 'server', 'views'),
    basedir: path.join(__dirname, '..', 'server', 'views'),
    noCache: process.env.NODE_ENV === 'development',
  });

  pug.use(app);

  return app;
};

export default createApp;
