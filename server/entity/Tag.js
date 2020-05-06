import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

import IsUnique from '../validators/IsUnique';

@Entity()
class Tag {
  @PrimaryGeneratedColumn()
  id = null;

  @Column('varchar')
  @IsUnique()
  @IsNotEmpty()
  name = '';
}

export default Tag;
