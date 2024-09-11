export interface Customer {
  ID: string;
  USERNAME?: string;
  TAX_CODE: string;
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
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
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
}

export interface CustomerInsertList {
  insert: CustomerInsertUpdate[];
  update: CustomerInsertUpdate[];
}
