import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('VOYAGE_CONTAINER')
export class VoyageContainerEntity extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  @IsNotEmpty()
  VOYAGE_ID: string;

  @Column()
  @IsNotEmpty()
  CNTR_NO: string;

  @Column()
  SHIPPER_ID: string;

  @Column()
  CNTR_SIZE: number;

  @Column()
  SEAL_NO: string;

  @Column()
  @IsNotEmpty()
  STATUS: string;

  @Column()
  NOTE: string;
}
