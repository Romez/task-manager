import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

import IsUnique from '../validators/IsUnique';

@Entity()
class Tag {
  @PrimaryGeneratedColumn()
  id = null;

  @Column('varchar', { unique: true })
  @IsUnique()
  @IsNotEmpty()
  name = '';

  @ManyToMany(() => 'Task')
  @JoinTable({
    name: 'tasks_tags',
    joinColumns: [{ name: 'tag_id' }],
    inverseJoinColumns: [{ name: 'task_id' }],
  })
  tasks;
}

export default Tag;
