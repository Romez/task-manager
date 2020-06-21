import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import taskStatuses from './task-statuses';
import tasks from './tasks';
import chat from './chat';

const controllers = [welcome, users, sessions, taskStatuses, tasks, chat];

export default (router, io) => controllers.forEach((f) => f(router, io));
