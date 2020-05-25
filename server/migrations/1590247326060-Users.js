/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { Table } from 'typeorm';

export class Users1590247326060 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'passwordDigest',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'firstName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lastName',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('user');
  }
}
