import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('CELL')
export class Cell extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  ROWGUID: string;

  @Column()
  @IsNotEmpty()
  BLOCK_ID: string;

  @Column()
  TIER_ORDERED: number;

  @Column()
  SLOT_ORDERED: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  CELL_LENGTH: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  CELL_WIDTH: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  CELL_HEIGHT: number;

  @Column({ default: false })
  IS_FILLED: boolean;
}
