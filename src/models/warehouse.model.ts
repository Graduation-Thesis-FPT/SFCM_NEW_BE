export interface WareHouse {
  ID: string;
  WAREHOUSE_NAME: string;
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
}
export interface WareHouseInfo {
  insert: WareHouse[];
  update: WareHouse[];
}
