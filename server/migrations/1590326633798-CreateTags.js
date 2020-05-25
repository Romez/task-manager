/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { Table } from 'typeorm';

export class CreateTags1590326633798 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'tag',
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
        ],
      }),
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('tag');
  }
}
