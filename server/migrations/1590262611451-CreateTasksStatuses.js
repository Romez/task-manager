/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { Table } from 'typeorm';

export class CreateTasksStatuses1590262611451 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'task_status',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'isDefault',
            type: 'boolean',
          },
        ],
      }),
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('task_status');
  }
}
