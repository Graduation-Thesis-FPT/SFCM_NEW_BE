import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('BLOCK')
export class Block extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  @IsNotEmpty()
  NAME: string;

  @Column()
  @IsNotEmpty()
  WAREHOUSE_ID: string;

  @Column()
  TOTAL_TIERS: number;

  @Column()
  TOTAL_CELLS: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  BLOCK_WIDTH: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  BLOCK_HEIGHT: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  BLOCK_LENGTH: number;
}
