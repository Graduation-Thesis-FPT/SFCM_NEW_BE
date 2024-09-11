export interface Customer {
  ID: string;
  USERNAME?: string;
  TAX_CODE: string;
  CREATE_BY?: string;
  CREATE_DATE?: Date;
  UPDATE_BY?: string;
  UPDATE_DATE?: Date;
}

export interface CustomerInsertUpdate {
  ID: string;
  USERNAME?: string;
  EMAIL: string;
  CUSTOMER_TYPE: string;
  CUSTOMER_NAME: string;
  TAX_CODE: string;
  ADDRESS: string;
  IS_ACTIVE: boolean;
  CREATE_BY?: string;
  CREATE_DATE?: Date;
  UPDATE_BY?: string;
  UPDATE_DATE?: Date;
}

export interface CustomerInsertList {
  insert: CustomerInsertUpdate[];
  update: CustomerInsertUpdate[];
}
