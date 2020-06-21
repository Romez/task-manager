/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { Table, TableForeignKey } from 'typeorm';

export class CreateChatMessages1593368152257 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'chat_message',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'integer',
          },
          {
            name: 'channel_id',
            type: 'integer',
          },
          {
            name: 'body',
            type: 'varchar',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'chat_message',
      new TableForeignKey({
        name: 'user_fk',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'chat_message',
      new TableForeignKey({
        name: 'channel_fk',
        columnNames: ['channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chat_channel',
        onDelete: 'CASCADE',
      }),
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('chat_message');
  }
}
