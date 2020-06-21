import 'regenerator-runtime/runtime';
import matchers from 'jest-supertest-matchers';

beforeAll(() => {
  expect.extend(matchers);
});
