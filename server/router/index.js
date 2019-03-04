const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('koa-jwt');
const services = require('../services');
const api = require('./api');

module.exports = function(nuxt) {
  const router = new Router();

  router.use(
    jwt({
      secret: services.config.get('server:auth:jwt-secret'),
      passthrough: true,
      key: 'jwtdata',
      cookie: 'jwt-token'
    })
  );
  router.use(bodyParser());
  router.use(services.config.get('server:apiBaseUrl'), api);

  if (nuxt) {
    router.get('*', ctx => {
      ctx.status = 200;
      ctx.respond = false; // Bypass Koa's built-in response handling test
      ctx.req.ctx = ctx; // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
      ctx.req.config = {
        apiBaseUrl: services.config.get('server:apiBaseUrl'),
        authEnable: services.config.get('server:auth:enable')
      };
      nuxt.render(ctx.req, ctx.res);
    });
  } else {
    router.get('/', ctx => {
      ctx.body = 'Simulate Server';
    });
  }

  return router.routes();
};
