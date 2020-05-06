import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import taskStatuses from './task-statuses';
import tasks from './tasks';

const controllers = [welcome, users, sessions, taskStatuses, tasks];

export default (router) => controllers.forEach((f) => f(router));
