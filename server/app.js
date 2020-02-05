import path from 'path';
import Koa from 'koa';
import Rollbar from 'rollbar';
import Pug from 'koa-pug';
import Router from 'koa-router';
import serve from 'koa-static';
import koaWebpack from 'koa-webpack';
import config from '../webpack.config';

const createApp = () => {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === 'production',
  });

  const app = new Koa();
  const router = new Router();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      rollbar.error(err, ctx.request);
      throw err;
    }
  });

  if (process.env.NODE_ENV === 'development') {
    koaWebpack({ config }).then((m) => app.use(m));
  }

  app.use(serve(path.join(__dirname, '..', 'public')));

  router.get('/', (ctx) => ctx.render('welcome/index'));

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
