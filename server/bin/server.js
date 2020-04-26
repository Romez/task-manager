#! /usr/bin/env node

import dotenv from 'dotenv';
import { createConnection } from 'typeorm';

import createApp from '../app';
import ormconfig from '../../ormconfig';

dotenv.config();

const run = async () => {
  const connection = await createConnection(ormconfig[process.env.NODE_ENV]);

  const server = createApp(connection);
  const port = process.env.PORT || 3000;

  const app = server.listen(port, () => {
    console.log(`Running on port ${port}`);
  });

  process.on('SIGINT', async () => {
    await connection.close();

    app.close(() => {
      process.exit(0);
    });
  });
};

run();
