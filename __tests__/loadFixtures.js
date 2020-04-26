import * as path from 'path';
import { getRepository } from 'typeorm';
import {
  Builder,
  Loader,
  Parser,
  Resolver,
} from 'typeorm-fixtures-cli/dist';

const loadFixtures = async (connection) => {
  const loader = new Loader();
  loader.load(path.join(__dirname, './fixtures'));

  const resolver = new Resolver();
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(connection, new Parser());

  await Promise.all(fixtures.map((fixture) => builder.build(fixture)
    .then((entity) => getRepository(entity.constructor.name).save(entity))));
};

export default loadFixtures;
