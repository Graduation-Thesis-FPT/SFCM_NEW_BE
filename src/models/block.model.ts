export interface Block {
  ID: string;
  NAME: string;
  WAREHOUSE_ID: string;
  TOTAL_TIERS: number;
  TOTAL_CELLS: number;
  BLOCK_WIDTH: number;
  BLOCK_LENGTH: number;
  BLOCK_HEIGHT: number;
  CREATE_BY?: string;
  CREATE_DATE?: Date;
  UPDATE_BY?: string;
  UPDATE_DATE?: Date;
}

export interface BlockListInfo {
  insert: Block[];
  update: Block[];
}
