/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import * as path from 'path';
import { Builder, Loader, Parser, Resolver, fixturesIterator } from 'typeorm-fixtures-cli/dist';

const loadFixtures = async (connection) => {
  const loader = new Loader();
  loader.load(path.join(__dirname, './fixtures'));

  const resolver = new Resolver();
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(connection, new Parser());

  const entities = {};
  for (const fixture of fixturesIterator(fixtures)) {
    const entity = await builder.build(fixture);
    const entityName = entity.constructor.name;
    const entitySaved = await connection.getRepository(entity.constructor.name).save(entity);
    if (!entities[entityName]) {
      entities[entityName] = {};
    }
    entities[entityName][fixture.name] = entitySaved;
  }

  return entities;
};

export default loadFixtures;
