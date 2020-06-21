import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity()
class ChatChannel {
  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  @IsNotEmpty()
  name;

  @Column('boolean')
  removable;
}

export default ChatChannel;
