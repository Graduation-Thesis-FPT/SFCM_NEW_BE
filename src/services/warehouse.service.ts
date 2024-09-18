import { BadRequestError } from '../core/error.response';
import { ERROR_MESSAGE } from '../constants';
import { User } from '../entity/user.entity';
import {
  getAllWarehouse,
  deleteWarehose,
  createWarehouse,
  updateWareHouse,
  findWarehouse,
} from '../repositories/warehouse.repo';
import { WareHouseInfo } from '../models/warehouse.model';

class WarehouseService {
  static createAndUpdateWarehouse = async (warehouseListInfo: WareHouseInfo, createBy: User) => {
    const insertData = warehouseListInfo.insert;
    const updateData = warehouseListInfo.update;

    let createdWarehouse = [];
    let updatedWarehouse;
    if (insertData.length) {
      for (const data of insertData) {
        const checkExist = await findWarehouse(data.ID);

        if (checkExist) {
          throw new BadRequestError(`Kho ${checkExist.NAME} đã được sử dụng!`);
        }
        data.CREATED_BY = createBy.USERNAME;
        data.UPDATED_BY = createBy.USERNAME;
        data.UPDATED_AT = new Date();
        data.CREATED_AT = new Date();
      }
    }
    createdWarehouse = await createWarehouse(insertData);

    if (updateData.length) {
      for (const data of updateData) {
        const checkExist = await findWarehouse(data.ID);

        if (!checkExist) {
          throw new BadRequestError(ERROR_MESSAGE.WAREHOUSE_NOT_EXIST);
        }
        data.UPDATED_BY = createBy.USERNAME;
        data.UPDATED_AT = new Date();
      }
      updatedWarehouse = await updateWareHouse(updateData);
    }
    return {
      createdWarehouse,
      updatedWarehouse,
    };
  };

  static deleteWarehouse = async (warehouseCodeList: string[]) => {
    for (const warehouseCode of warehouseCodeList) {
      const warehouse = await findWarehouse(warehouseCode);
      if (!warehouse) {
        throw new BadRequestError(`Mã kho ${warehouse.ID} không tồn tại!`);
      }
    }

    return await deleteWarehose(warehouseCodeList);
  };

  static getAllWarehouse = async () => {
    return await getAllWarehouse();
  };
}
export default WarehouseService;
