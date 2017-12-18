const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const next = require('next');
const routes = require('./routes');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = routes.getRequestHandler(app);

const BITFINEX_API = 'https://api.bitfinex.com/';

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception', err);
});

app.prepare()
  .then(() => {
    const server = express();

    // == API ==

    const userResHeaderDecorator = (headers) => {
      headers['cache-control'] = 'no-cache, no-store, must-revalidate';
      return headers;
    };

    server.options('/api/bitfinex', cors());
    server.use('/api/bitfinex', cors(), proxy(BITFINEX_API, {
      https: true,
      userResHeaderDecorator,
    }));

    server.use(handler);

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
