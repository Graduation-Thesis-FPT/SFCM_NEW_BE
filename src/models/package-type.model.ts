import { Base } from './base.model';

export interface ItemType extends Base {
  ID: string;
  NAME: string;
}
export interface ItemTypeInfo {
  insert: ItemType[];
  update: ItemType[];
}
