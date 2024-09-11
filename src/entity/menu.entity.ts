import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('MENU')
export class Menu extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  ID: string;

  @Column()
  PARENT_ID: string;

  @Column()
  MENU_NAME: string;

  @Column()
  IS_VISIBLE: boolean;

  @Column()
  PAGE_COMPONENT: string;

  @Column()
  MENU_ICON: string;

  @Column()
  ORDER_BY: number;
}
