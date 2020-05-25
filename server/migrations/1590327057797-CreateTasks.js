/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { Table, TableForeignKey } from 'typeorm';

export class CreateTasks1590327057797 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'task',
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
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status_id',
            type: 'integer',
          },
          {
            name: 'creator_id',
            type: 'integer',
          },
          {
            name: 'assigned_to_id',
            type: 'integer',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'task',
      new TableForeignKey({
        name: 'status_fk',
        columnNames: ['status_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'task_status',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'task',
      new TableForeignKey({
        name: 'creator_fk',
        columnNames: ['creator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'task',
      new TableForeignKey({
        name: 'assigned_to_fk',
        columnNames: ['assigned_to_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
      }),
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('task');
  }
}
