export interface WareHouse {
  ID: string;
  WAREHOUSE_NAME: string;
  CREATE_BY?: string;
  CREATE_DATE?: Date;
  UPDATE_BY?: string;
  UPDATE_DATE?: Date;
}
export interface WareHouseInfo {
  insert: WareHouse[];
  update: WareHouse[];
}
