export interface ImportOrder {
  ID: string;
  PAYMENT_ID: string;
  NOTE?: string;
  STATUS: 'COMPLETED' | 'CANCELLED';
  CAN_CANCEL: boolean;
  CANCEL_NOTE?: string;
}

export interface ImportOrderDetail {
  ROWGUID: string;
  ORDER_ID: string;
  VOYAGE_CONTAINER_ID: string;
  CONTAINER_TARIFF_ID: string;
  NOTE?: string;
}
