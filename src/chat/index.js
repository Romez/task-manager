import './setupLocalization';
import run from './init';

if (process.env.NODE_ENV !== 'production') {
  localStorage.debug = 'chat:*';
}

run();
