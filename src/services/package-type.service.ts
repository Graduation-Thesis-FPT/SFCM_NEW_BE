import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import {
  getItemType,
  deleteItemtype,
  findItemType,
  findItemTypeByCode,
  createItemType,
  updateItemType,
} from '../repositories/package-type.repo';
import { ItemTypeInfo } from '../models/package-type.model';
import { manager } from '../repositories/index.repo';

class ItemTypeService {
  static createAndUpdateItemType = async (itemTypeListInfo: ItemTypeInfo, createBy: User) => {
    const insertData = itemTypeListInfo.insert;
    const updateData = itemTypeListInfo.update;

    let createdItemType;
    let updatedItemType;
    await manager.transaction(async transactionEntityManager => {
      if (insertData.length) {
        for (const data of insertData) {
          const checkExist = await findItemTypeByCode(data.ID, transactionEntityManager);

          if (checkExist) {
            throw new BadRequestError(`Mã loại hàng hóa ${data.ID} đã tồn tại`);
          }
          data.CREATE_BY = createBy.USERNAME;
          data.UPDATE_BY = createBy.USERNAME;
          data.UPDATE_DATE = new Date();
          data.CREATE_DATE = new Date();
        }
        createdItemType = await createItemType(insertData, transactionEntityManager);
      }

      if (updateData.length) {
        for (const data of updateData) {
          const checkExist = await findItemTypeByCode(data.ID, transactionEntityManager);

          if (!checkExist) {
            throw new BadRequestError(`Mã loại hàng hóa ${data.ID} không tồn tại`);
          }
          data.UPDATE_BY = createBy.USERNAME;
          data.UPDATE_DATE = new Date();
        }
        updatedItemType = await updateItemType(updateData, transactionEntityManager);
      }
    });
    return {
      createdItemType,
      updatedItemType,
    };
  };

  static deleteItemType = async (ItemTypeCodeList: string[]) => {
    for (const ItemTypeCode of ItemTypeCodeList) {
      const ItemType = await findItemType(ItemTypeCode);
      if (!ItemType) {
        throw new BadRequestError(`ItemType with ID ${ItemType.ID} not exist!`);
      }
    }

    return await deleteItemtype(ItemTypeCodeList);
  };

  static getAllItemType = async () => {
    return await getItemType();
  };
}
export default ItemTypeService;
