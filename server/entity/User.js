import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';
import { IsNotEmpty, IsEmail } from 'class-validator';
import i18next from 'i18next';

import IsUnique from '../validators/IsUnique';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id = null;

  @Column('varchar')
  @IsUnique({ message: (args) => i18next.t('entity.User.validates.email.unique', { name: args.value }) })
  @IsEmail({}, { message: (args) => i18next.t('entity.User.validates.email.isEmail', { email: args.value }) })
  @IsNotEmpty()
  email = '';

  @Column('varchar')
  @IsNotEmpty()
  passwordDigest = '';

  @Column('varchar', { nullable: true })
  firstName = '';

  @Column('varchar', { nullable: true })
  lastName = '';

  @DeleteDateColumn()
  deletedAt = null;

  isGuest = false;

  get fullName() {
    if (this.firstName || this.lastName) {
      return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName;
    }
    return this.email;
  }
}
export default User;
