import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import i18next from 'i18next';
import { IsNotEmpty } from 'class-validator';

import Tag from './Tag';
import User from './User';
import TaskStatus from './TaskStatus';

@Entity()
class Task {
  @PrimaryGeneratedColumn()
  id = null;

  @Column('varchar')
  @IsNotEmpty({
    message: () => i18next.t('entity.Task.validates.name.isNotEmpty'),
  })
  name;

  @Column('varchar', { nullable: true })
  description;

  @ManyToOne(() => TaskStatus)
  @JoinColumn({ name: 'status_id' })
  status;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'tasks_tags',
    joinColumns: [{ name: 'task_id' }],
    inverseJoinColumns: [{ name: 'tag_id' }],
  })
  tags;
}

export default Task;
