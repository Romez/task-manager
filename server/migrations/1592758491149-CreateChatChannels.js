/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { Table } from 'typeorm';

import ChatChannel from '../entity/ChatChannel';

const chatChannels = [
  { name: 'general', removable: false },
  { name: 'random', removable: false },
];

export class CreateChatChannels1592758491149 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'chat_channel',
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
            name: 'removable',
            type: 'boolean',
          },
        ],
      }),
      true,
    );

    const chatChannelRepo = queryRunner.manager.getRepository(ChatChannel, process.env.NODE_ENV);
    await chatChannelRepo.save(chatChannels);
  }

  async down(queryRunner) {
    await queryRunner.dropTable('chat_channel');
  }
}
