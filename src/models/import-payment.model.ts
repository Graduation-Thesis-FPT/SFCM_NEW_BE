export interface ImportOrderPayment {
  ID?: string;
  PRE_VAT_AMOUNT: number;
  VAT_AMOUNT: number;
  TOTAL_AMOUNT: number;
  STATUS: 'PENDING' | 'PAID' | 'CANCELLED';
  CANCEL_DATE?: Date | null;
  CANCEL_REMARK?: string | null;
  CANCELLED_BY?: string | null;
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
}
