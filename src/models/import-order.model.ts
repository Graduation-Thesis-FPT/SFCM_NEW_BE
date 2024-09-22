export interface ImportOrder {
  ID: string;
  PAYMENT_ID: string;
  NOTE?: string;
  STATUS: 'COMPLETED' | 'CANCELLED';
  CAN_CANCEL: boolean;
  CANCEL_NOTE?: string;
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
}

export interface ImportOrderDetail {
  ROWGUID?: string;
  ORDER_ID: string;
  VOYAGE_CONTAINER_ID: string;
  CONTAINER_TARIFF_ID: string;
  NOTE?: string;
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
}
