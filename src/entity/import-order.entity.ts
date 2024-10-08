import { Entity, Column, PrimaryColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import BaseModel from './model.entity';

@Entity('IMPORT_ORDER')
export class ImportOrder extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  @IsNotEmpty()
  PAYMENT_ID: string;

  @Column({ nullable: true })
  NOTE: string;

  @Column({
    default: 'COMPLETED',
  })
  STATUS: string;

  @Column({ default: true })
  CAN_CANCEL: boolean;

  @Column({ nullable: true })
  CANCEL_NOTE: string;
}
