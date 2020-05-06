import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
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
  name = '';

  @Column('varchar', { nullable: true })
  description = '';

  @ManyToOne(
    () => TaskStatus,
    (status) => status.tasks,
  )
  status;

  @ManyToOne(
    () => 'User',
    (user) => user.cteatedTasks,
  )
  creator;

  @ManyToOne(
    () => User,
    (user) => user.assignedTasks,
  )
  assignedTo;

  @ManyToMany(
    () => Tag,
    (tag) => tag.task,
  )
  @JoinTable()
  tags;
}

export default Task;
