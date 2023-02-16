import {ApplicationConfig} from '@loopback/core';
import {FirstappApplication} from './application';

import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Export the OpenAPI spec from the application
 */
async function exportOpenApiSpec(): Promise<void> {
  const config: ApplicationConfig = {
    rest: {
      port: Number(process.env.EXTPORT),
      host: process.env.HOST,
    },
  };
  const outFile = process.argv[2] ?? '';
  const app = new FirstappApplication(config);
  await app.boot();
  await app.exportOpenApiSpec(outFile);
}

exportOpenApiSpec().catch(err => {
  console.error('Fail to export OpenAPI spec from the application.', err);
  process.exit(1);
});
