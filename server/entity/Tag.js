import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, RelationId } from 'typeorm';
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
    joinColumns: [{ name: 'tag_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'task_id', referencedColumnName: 'id' }],
  })
  tasks;

  @RelationId((tag) => tag.tasks)
  taskIds;
}

export default Tag;
