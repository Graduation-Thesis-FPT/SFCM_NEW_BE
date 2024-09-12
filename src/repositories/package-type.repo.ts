import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { PackageType as PackageTypeEntity } from '../entity/package-type.entity';
import { ItemType } from '../models/package-type.model';

export const itemTypeRepository = mssqlConnection.getRepository(PackageTypeEntity);

const getItemType = async () => {
  return await itemTypeRepository.find({
    order: {
      UPDATED_AT: 'DESC',
    },
  });
};

const deleteItemtype = async (itemTypeListId: string[]) => {
  return await itemTypeRepository.delete(itemTypeListId);
};

const findItemTypeByCode = async (ID: string, transactionEntityManager: EntityManager) => {
  return await transactionEntityManager
    .createQueryBuilder(PackageTypeEntity, 'item')
    .where('item.ID = :ITEM_TYPE_CODE', { ITEM_TYPE_CODE: ID })
    .getOne();
};

const createItemType = async (
  itemTypeList: ItemType[],
  transactionEntityManager: EntityManager,
) => {
  const itemType = itemTypeRepository.create(itemTypeList);
  const newitemType = await transactionEntityManager.save(itemType);
  return newitemType;
};

const updateItemType = async (
  itemTypeList: ItemType[],
  transactionEntityManager: EntityManager,
) => {
  for await (const data of itemTypeList) {
    await transactionEntityManager.update(PackageTypeEntity, data.ID, data);
  }
  return true;
};

const findItemType = async (ID: string) => {
  return await itemTypeRepository
    .createQueryBuilder('item')
    .where('item.ID = :ITEM_TYPE_CODE', { ITEM_TYPE_CODE: ID })
    .getOne();
};

export {
  getItemType,
  deleteItemtype,
  findItemTypeByCode,
  createItemType,
  updateItemType,
  findItemType,
};
