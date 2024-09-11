export interface Block {
  ID: string;
  NAME: string;
  WAREHOUSE_ID: string;
  TOTAL_TIERS: number;
  TOTAL_CELLS: number;
  BLOCK_WIDTH: number;
  BLOCK_LENGTH: number;
  BLOCK_HEIGHT: number;
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
}

export interface BlockListInfo {
  insert: Block[];
  update: Block[];
}
