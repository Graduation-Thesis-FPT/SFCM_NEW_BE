import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('USER')
export class User extends BaseModel {
  @PrimaryColumn()
  USERNAME: string;

  @IsOptional()
  @Column({ select: false, nullable: true })
  PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  ROLE_CODE: string;

  @IsOptional()
  @Column({ nullable: true })
  FULLNAME: string;

  @IsOptional()
  @Column({ type: 'datetime' })
  @IsDate()
  BIRTHDAY: Date;

  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  ADDRESS: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  @Column({ nullable: true })
  TELEPHONE: string;

  @IsOptional()
  @IsEmail()
  @Column({
    nullable: true,
  })
  EMAIL: string;

  @IsOptional()
  @Column({ default: true })
  IS_ACTIVE: boolean;

  @IsOptional()
  @Column({ nullable: true })
  @IsString()
  REMARK: string;
}
