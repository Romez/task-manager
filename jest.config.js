const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  testEnvironment: 'node',
  testRegex: '.*(test)\\.js$',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
