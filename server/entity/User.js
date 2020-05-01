import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsNotEmpty, IsEmail } from 'class-validator';
import IsUnique from '../validators/IsUnique';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id = null;

  @Column('varchar', { unique: true })
  @IsEmail()
  @IsNotEmpty()
  @IsUnique({ message: 'Email $value already exists. Choose another email.' })
  email = '';

  @Column('varchar')
  @IsNotEmpty()
  passwordDigest = '';

  @Column('varchar', { nullable: true })
  firstName = '';

  @Column('varchar', { nullable: true })
  lastName = '';

  isGuest = false;
}
export default User;
