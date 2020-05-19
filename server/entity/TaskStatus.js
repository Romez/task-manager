import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';
import i18next from 'i18next';

import IsUnique from '../validators/IsUnique';

@Entity()
class TaskStatus {
  @PrimaryGeneratedColumn()
  id = null;

  @Column('varchar')
  @IsUnique({
    message: (args) => i18next.t('entity.TaskStatus.validates.name.unique', { name: args.value }),
  })
  name = '';

  @Column('boolean', { default: false })
  isDefault;

  @DeleteDateColumn()
  deletedAt = null;
}

export default TaskStatus;
