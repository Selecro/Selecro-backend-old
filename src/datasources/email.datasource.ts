import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  name: 'email',
  connector: 'mail',
  transports: [
    {
      type: 'SMTP',
      host: process.env.EMAILHOST,
      secure: true,
      port: Number(process.env.EMAILPORT),
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASSWORD
      }
    }
  ]
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class EmailDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'email';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.email', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
