import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { Cell as CellEntity } from '../entity/cell.entity';
const cellRepository = mssqlConnection.getRepository(CellEntity);

const findCellInWarehouse = async (cellID: string, warehouseId: string): Promise<CellEntity> => {
  return await cellRepository
    .createQueryBuilder('cell')
    .leftJoinAndSelect('BLOCK', 'block', 'block.ID = cell.BLOCK_ID')
    .where('cell.ROWGUID = :cellID', { cellID })
    .andWhere('block.WAREHOUSE_ID = :warehouseId', { warehouseId })
    .select([
      'cell.ROWGUID as ROWGUID',
      'cell.TIER_ORDERED as TIER_ORDERED',
      'cell.SLOT_ORDERED as SLOT_ORDERED',
      'cell.CELL_WIDTH as CELL_WIDTH',
      'cell.CELL_HEIGHT as CELL_HEIGHT',
      'cell.CELL_LENGTH as CELL_LENGTH',
      'cell.IS_FILLED as IS_FILLED',
      'cell.BLOCK_ID as BLOCK_ID',
      'block.WAREHOUSE_ID as WAREHOUSE_ID',
      'block.NAME as NAME',
    ])
    .getRawOne();
};

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
      IS_FILLED: true,
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
      'cell.BLOCK_ID as BLOCK_ID',
      'block.WAREHOUSE_ID as WAREHOUSE_ID',
      'block.ID as ID',
      'block.NAME as NAME',
    ])
    .orderBy('cell.TIER_ORDERED', 'ASC')
    .orderBy('cell.SLOT_ORDERED', 'ASC')
    .getRawMany();
};

const getAllAvailableCell = async ({
  SEPARATED_PACKAGE_LENGTH,
  SEPARATED_PACKAGE_WIDTH,
  SEPARATED_PACKAGE_HEIGHT,
}: {
  SEPARATED_PACKAGE_HEIGHT: number;
  SEPARATED_PACKAGE_WIDTH: number;
  SEPARATED_PACKAGE_LENGTH: number;
}) => {
  const maxCellDimention = await cellRepository
    .createQueryBuilder('cell')
    .where('cell.IS_FILLED = 0')
    .andWhere('cell.CELL_HEIGHT >= :SEPARATED_PACKAGE_HEIGHT', { SEPARATED_PACKAGE_HEIGHT })
    .andWhere('cell.CELL_WIDTH >= :SEPARATED_PACKAGE_WIDTH', { SEPARATED_PACKAGE_WIDTH })
    .andWhere('cell.CELL_LENGTH >= :SEPARATED_PACKAGE_LENGTH', { SEPARATED_PACKAGE_LENGTH })
    .select('cell.ROWGUID', 'ROWGUID')
    .addSelect('cell.CELL_WIDTH', 'CELL_WIDTH')
    .addSelect('cell.CELL_HEIGHT', 'CELL_HEIGHT')
    .addSelect('cell.CELL_LENGTH', 'CELL_LENGTH')
    .addSelect('cell.BLOCK_ID', 'BLOCK_ID')
    .getRawMany();
  return maxCellDimention;
};

const getAllPackagePositionByWarehouseCode = async (warehouseCode: string) => {
  return await cellRepository
    .createQueryBuilder('cell')
    .innerJoinAndSelect('BLOCK', 'block', 'block.ID = cell.BLOCK_ID')
    .leftJoinAndSelect('PACKAGE_CELL_ALLOCATION', 'pca', 'pca.CELL_ID = cell.ROWGUID')
    .leftJoinAndSelect('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pca.VOYAGE_CONTAINER_PACKAGE_ID = pk.ID')
    .where('block.WAREHOUSE_ID = :warehouseCode', { warehouseCode })
    .select([
      'pk.ID as package_ID',
      'pk.HOUSE_BILL as HOUSE_BILL',
      'pk.CONSIGNEE_ID as CONSIGNEE_ID',
      'pk.PACKAGE_UNIT as PACKAGE_UNIT',
      'pca.NOTE as NOTE',
      'pca.CELL_ID as CELL_ID',
      'pca.ROWGUID as packageCellAllocation_ROWGUID',
      'pca.SEQUENCE as SEQUENCE',
      'pca.ITEMS_IN_CELL as ITEMS_IN_CELL',
      'cell.ROWGUID as ROWGUID',
      'cell.BLOCK_ID as BLOCK_ID',
      'cell.CELL_LENGTH as CELL_LENGTH',
      'cell.CELL_WIDTH as CELL_WIDTH',
      'cell.CELL_HEIGHT as CELL_HEIGHT',
      'cell.TIER_ORDERED as TIER_ORDERED',
      'cell.SLOT_ORDERED as SLOT_ORDERED',
      'cell.IS_FILLED as IS_FILLED',
      'block.WAREHOUSE_ID as WAREHOUSE_ID',
      'block.NAME as BLOCK_NAME',
    ])
    .getRawMany();
};

export {
  findCellInWarehouse,
  updateNewCellStatus,
  findCellById,
  updateOldCellStatus,
  findCellByWarehouseCode,
  getAllAvailableCell,
  updateNewCellStatusTransaction,
  getAllPackagePositionByWarehouseCode,
};
