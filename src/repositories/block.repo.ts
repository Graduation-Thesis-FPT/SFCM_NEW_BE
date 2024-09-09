import mssqlConnection from '../dbs/mssql.connect';
import { Block as BlockEntity } from '../entity/block.entity';
import { Cell as CellEntity } from '../entity/cell.entity';
import { Block } from '../models/block.model';
import { warehouseRepository } from './warehouse.repo';
import { Cell } from '../models/cell.model';
import { EntityManager } from 'typeorm';

export const blockRepository = mssqlConnection.getRepository(BlockEntity);
export const cellRepository = mssqlConnection.getRepository(CellEntity);

const checkDuplicateBlock = async (BLOCK_CODE: string) => {
  return await blockRepository
    .createQueryBuilder('block')
    .where('block.BLOCK_CODE = :blockCode', { blockCode: BLOCK_CODE })
    .getOne();
};

const createBlockandCell = async (blockListInfo: Block[], statusCreateBlock: boolean = true) => {
  const arrayCell: Cell[] = [];
  for (let i = 0; i < blockListInfo.length; i++) {
    const blockInfo = blockListInfo[i];
    const cellHeight = blockInfo.BLOCK_HEIGHT / blockInfo.TOTAL_TIERS;
    const cellWidth = blockInfo.BLOCK_WIDTH;
    const cellLength = blockInfo.BLOCK_LENGTH / blockInfo.TOTAL_CELLS;
    for (let j = 0; j < blockInfo.TOTAL_CELLS; j++) {
      for (let o = 0; o < blockInfo.TOTAL_TIERS; o++) {
        arrayCell.push({
          BLOCK_ID: blockInfo.ID,
          TIER_ORDERED: o + 1,
          SLOT_ORDERED: j + 1,
          IS_FILLED: false,
          CELL_LENGTH: cellLength,
          CELL_WIDTH: cellWidth,
          CELL_HEIGHT: cellHeight,
          CREATE_BY: blockInfo.CREATE_BY,
          CREATE_DATE: blockInfo.CREATE_DATE,
          UPDATE_BY: blockInfo.UPDATE_BY,
          UPDATE_DATE: blockInfo.UPDATE_DATE,
        });
      }
    }
  }

  let newBlock: Block[] = [];
  if (statusCreateBlock) {
    newBlock = await blockRepository.save(blockListInfo);
  }
  await cellRepository.save(arrayCell);
  return newBlock;
};

const checkCellStatus = async (blockListID: string[]) => {
  const cellArrStatus = await cellRepository
    .createQueryBuilder('cell')
    .select(['cell.BLOCK_ID'])
    .where('BLOCK_ID IN (:...ids)', { ids: blockListID })
    .andWhere('cell.STATUS = :status', { status: 1 })
    .getMany();

  return cellArrStatus;
};

const deleteBlockMany = async (blockListId: string[], statusDeleteBlock: boolean = true) => {
  await cellRepository
    .createQueryBuilder()
    .delete()
    .where('BLOCK_ID IN (:...ids)', { ids: blockListId })
    .from('BS_CELL')
    .execute();
  if (statusDeleteBlock) {
    await blockRepository.delete(blockListId);
  }
  return true;
};

const updateBlock = async (blockListInfo: Block[]) => {
  const blockCode = blockListInfo.map(e => e.ID);
  await deleteBlockMany(blockCode, false);
  await createBlockandCell(blockListInfo, false);
  return await Promise.all(blockListInfo.map(block => blockRepository.update(block.ID, block)));
};

const getAllBlock = async () => {
  return await blockRepository.find({
    order: {
      UPDATE_DATE: 'DESC',
    },
  });
};

const isValidWarehouseCode = async (warehouseCode: string) => {
  return await warehouseRepository
    .createQueryBuilder('wh')
    .where('wh.ID = :warehouseCode', { warehouseCode: warehouseCode })
    .getOne();
};

const getAllCell = async (WAREHOUSE_ID: string = '', BLOCK_CODE: string = '') => {
  const queryBuilder = cellRepository
    .createQueryBuilder('cell')
    .select(['cell.*'])
    .leftJoin('BS_BLOCK', 'block', 'block.BLOCK_CODE = cell.BLOCK_CODE')
    .addSelect('block.BLOCK_NAME', 'BLOCK_NAME')
    .addSelect('block.WAREHOUSE_ID', 'WAREHOUSE_ID');

  if (BLOCK_CODE !== 'all') {
    queryBuilder.andWhere('cell.BLOCK_CODE = :blockCode', { blockCode: BLOCK_CODE });
  }

  if (WAREHOUSE_ID) {
    queryBuilder.andWhere('block.WAREHOUSE_ID = :warehouseCode', {
      warehouseCode: WAREHOUSE_ID,
    });
  }

  return await queryBuilder.getRawMany();
};

const findBlockByCode = async (blockCode: string, transactionEntityManager: EntityManager) => {
  return await transactionEntityManager
    .createQueryBuilder(BlockEntity, 'block')
    .where('block.BLOCK_CODE = :blockCode', { blockCode: blockCode })
    .getOne();
};

export {
  createBlockandCell,
  checkDuplicateBlock,
  deleteBlockMany,
  getAllBlock,
  checkCellStatus,
  isValidWarehouseCode,
  updateBlock,
  getAllCell,
  findBlockByCode,
};
