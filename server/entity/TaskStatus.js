import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import i18next from 'i18next';

import IsUnique from '../validators/IsUnique';

@Entity()
class TaskStatus {
  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  @IsUnique({
    message: (args) => i18next.t('entity.TaskStatus.validates.name.unique', { name: args.value }),
  })
  name;

  @OneToMany(
    () => 'Task',
    (task) => task.status,
  )
  tasks;

  @Column('boolean', { default: false })
  isDefault;
}

export default TaskStatus;
