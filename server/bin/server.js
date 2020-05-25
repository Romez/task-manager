#! /usr/bin/env node

import dotenv from 'dotenv';
import { createConnection } from 'typeorm';

import createApp from '../app';

dotenv.config();

const run = async () => {
  const connection = await createConnection(process.env.NODE_ENV);

  const server = createApp(connection);
  const port = process.env.PORT || 3000;

  const app = server.listen(port, () => {
    console.log(`Running on port ${port}`);
  });

  process.on('SIGINT', () => {
    app.close(async () => {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      } finally {
        process.exit(0);
      }
    });
  });
};

run();
