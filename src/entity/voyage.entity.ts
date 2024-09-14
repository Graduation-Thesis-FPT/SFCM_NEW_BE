import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('VOYAGE')
export class VoyageEntity extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  VESSEL_NAME: string;

  @IsNotEmpty()
  @Column()
  ETA: Date;
}
