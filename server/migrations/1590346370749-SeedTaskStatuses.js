/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import TaskStatus from '../entity/TaskStatus';

const statuses = [
  { name: 'new', isDefault: true },
  { name: 'in progress', isDefault: false },
  { name: 'in testing', isDefault: false },
  { name: 'finished', isDefault: false },
];

export class SeedTaskStatuses1590346370749 {
  async up(queryRunner) {
    const statusRepo = queryRunner.manager.getRepository(TaskStatus, process.env.NODE_ENV);
    await statusRepo.save(statuses);
  }
}
