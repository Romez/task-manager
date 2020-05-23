import matchers from 'jest-supertest-matchers';

beforeAll(() => {
  expect.extend(matchers);
});
