import * as fs from 'fs';
import {ApplicationConfig, FirstappApplication} from './application';

import * as dotenv from 'dotenv';
dotenv.config();

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new FirstappApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: Number(process.env.EXTPORT),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      protocol: 'https',
      key: fs.readFileSync('localhost.decrypt.key'),
      cert: fs.readFileSync('localhost.crt'),
      socketio: {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
          credentials: true,
        },
        port: 4000,
      },
      websocket: {port: 4000},
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
