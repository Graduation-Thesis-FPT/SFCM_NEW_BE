import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('SA_MENU')
export class Menu extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  ROWGUID: string;

  @Column()
  PARENT_CODE: string;

  @Column()
  @IsNotEmpty()
  MENU_CODE: string;

  @Column()
  @IsNotEmpty()
  MENU_NAME: string;

  @Column()
  MENU_ICON: string;

  @Column()
  IS_VISIBLE: boolean;

  @Column()
  @IsNotEmpty()
  ORDER_BY: number;

  @Column()
  VIEW_PAGE: string;
}
