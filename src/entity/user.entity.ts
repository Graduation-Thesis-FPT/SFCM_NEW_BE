import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('SA_USER')
export class User extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  ROWGUID: string;

  @MaxLength(450, {
    message: 'USER_NAME have max length is 100 character',
  })
  @Column()
  @IsNotEmpty()
  USER_NAME: string;

  @IsOptional()
  @Column({ nullable: true })
  FULLNAME: string;

  @IsOptional()
  @Column({ select: false, nullable: true })
  PASSWORD: string;

  @IsOptional()
  @IsEmail()
  @Column({
    nullable: true,
  })
  EMAIL: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  @Column({ nullable: true })
  TELEPHONE: string;

  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  ADDRESS: string;

  @IsOptional()
  @Column({ type: 'datetime' })
  @IsDate()
  BIRTHDAY: Date;

  @IsNotEmpty()
  @IsString()
  @Column()
  ROLE_CODE: string;

  @IsOptional()
  @Column({ default: true })
  IS_ACTIVE: boolean;

  @IsOptional()
  @Column({ nullable: true })
  @IsString()
  REMARK: string;
}
