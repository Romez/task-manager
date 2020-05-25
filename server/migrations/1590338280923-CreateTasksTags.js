/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { Table, TableForeignKey } from 'typeorm';

export class CreateTasksTags1590338280923 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'tasks_tags',
        columns: [
          {
            name: 'task_id',
            type: 'integer',
          },
          {
            name: 'tag_id',
            type: 'integer',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'tasks_tags',
      new TableForeignKey({
        name: 'task_fk',
        columnNames: ['task_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'task',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks_tags',
      new TableForeignKey({
        name: 'tag_fk',
        columnNames: ['tag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tag',
        onDelete: 'RESTRICT',
      }),
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('tasks_tags');
  }
}
