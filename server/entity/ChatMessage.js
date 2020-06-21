import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

import User from './User';
import ChatChannel from './ChatChannel';

@Entity()
class ChatMessage {
  @PrimaryGeneratedColumn()
  id;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user;

  @RelationId((message) => message.user)
  userId;

  @ManyToOne(() => ChatChannel)
  @JoinColumn({ name: 'channel_id' })
  channel;

  @RelationId((message) => message.channel)
  channelId;

  @Column('varchar')
  @IsNotEmpty()
  body;
}

export default ChatMessage;
