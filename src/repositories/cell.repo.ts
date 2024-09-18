import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { Cell as CellEntity } from '../entity/cell.entity';
const cellRepository = mssqlConnection.getRepository(CellEntity);

// const findCellInWarehouse = async (cellID: string, warehouseCode: string): Promise<CellEntity> => {
//   return await cellRepository
//     .createQueryBuilder('cell')
//     .leftJoinAndSelect('BS_BLOCK', 'block', 'block.BLOCK_CODE = cell.BLOCK_CODE')
//     .where('cell.ROWGUID = :cellID', { cellID })
//     .andWhere('block.WAREHOUSE_CODE = :warehouseCode', { warehouseCode })
//     .select([
//       'cell.TIER_ORDERED as TIER_ORDERED',
//       'cell.SLOT_ORDERED as SLOT_ORDERED',
//       'cell.CELL_WIDTH as CELL_WIDTH',
//       'cell.CELL_HEIGHT as CELL_HEIGHT',
//       'cell.CELL_LENGTH as CELL_LENGTH',
//       'cell.STATUS as STATUS',
//       'block.WAREHOUSE_CODE as WAREHOUSE_CODE',
//       'block.BLOCK_CODE as BLOCK_CODE',
//       'block.BLOCK_NAME as BLOCK_NAME',
//     ])
//     .getRawOne();
// };

const findCellById = async (cellID: string): Promise<CellEntity> => {
  return await cellRepository
    .createQueryBuilder('cell')
    .where('cell.ROWGUID = :cellID', { cellID })
    .getOne();
};

const updateNewCellStatus = async (cellID: string) => {
  return await cellRepository
    .createQueryBuilder('cell')
    .update(CellEntity)
    .set({
      IS_FILLED: false,
    })
    .where('ROWGUID = :cellID', { cellID })
    .execute();
};

const updateNewCellStatusTransaction = async (
  transactionalEntityManager: EntityManager,
  cellID: string,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(CellEntity, 'cell')
    .update(CellEntity)
    .set({
      IS_FILLED: true,
    })
    .where('ROWGUID = :cellID', { cellID });
};

const updateOldCellStatus = async (cellID: string) => {
  return await cellRepository
    .createQueryBuilder('cell')
    .update(CellEntity)
    .set({
      IS_FILLED: false,
    })
    .where('ROWGUID = :cellID', { cellID })
    .execute();
};

const findCellByWarehouseCode = async (warehouseCode: string): Promise<CellEntity[]> => {
  return await cellRepository
    .createQueryBuilder('cell')
    .leftJoinAndSelect('BLOCK', 'block', 'block.ID = cell.BLOCK_ID')
    .where('block.WAREHOUSE_ID = :warehouseCode', { warehouseCode })
    .andWhere('cell.IS_FILLED = 0')
    .select([
      'cell.ROWGUID as ROWGUID',
      'cell.CELL_WIDTH as CELL_WIDTH',
      'cell.CELL_HEIGHT as CELL_HEIGHT',
      'cell.CELL_LENGTH as CELL_LENGTH',
      'cell.TIER_ORDERED as TIER_ORDERED',
      'cell.IS_FILLED as IS_FILLED',
      'block.WAREHOUSE_ID as WAREHOUSE_ID',
      'block.ID as ID',
      'block.NAME as NAME',
    ])
    .orderBy('cell.TIER_ORDERED', 'ASC')
    .orderBy('cell.SLOT_ORDERED', 'ASC')
    .getRawMany();
};

const getAllAvailableCell = async ({
  packageLength,
  packageWidth,
  packageHeight,
}: {
  packageHeight: number;
  packageWidth: number;
  packageLength: number;
}) => {
  const maxCellDimention = await cellRepository
    .createQueryBuilder('cell')
    .where('cell.IS_FILLED = 0')
    .andWhere('cell.CELL_HEIGHT >= :packageHeight', { packageHeight })
    .andWhere('cell.CELL_WIDTH >= :packageWidth', { packageWidth })
    .andWhere('cell.CELL_LENGTH >= :packageLength', { packageLength })
    .select('cell.ROWGUID', 'ROWGUID')
    .addSelect('cell.CELL_WIDTH', 'CELL_WIDTH')
    .addSelect('cell.CELL_HEIGHT', 'CELL_HEIGHT')
    .addSelect('cell.CELL_LENGTH', 'CELL_LENGTH')
    .addSelect('cell.BLOCK_ID', 'BLOCK_ID')
    .getRawMany();
  return maxCellDimention;
};

export {
  // findCellInWarehouse,
  updateNewCellStatus,
  findCellById,
  updateOldCellStatus,
  findCellByWarehouseCode,
  getAllAvailableCell,
  updateNewCellStatusTransaction,
};
