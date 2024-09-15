import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import BaseModel from './model.entity';

@Entity('IMPORT_ORDER_DETAIL')
export class ImportOrderDetail extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  ROWGUID: string;

  @Column()
  ORDER_ID: string;

  @Column()
  VOYAGE_CONTAINER_ID: string;

  @Column()
  CONTAINER_TARIFF_ID: string;

  @Column({ nullable: true })
  NOTE: string;
}
