const nextRoutes = require('next-routes');

const routes = module.exports = nextRoutes();

routes.add({ name: 'index', pattern: '/' });
routes.add({ name: 'trade', pattern: '/trade/:symbol' });
