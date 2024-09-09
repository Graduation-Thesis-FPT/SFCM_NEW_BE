import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import WarehouseService from '../services/warehouse.service';

class WarehouseController {
  createWarehouse = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const warehouseList = res.locals.requestData;
    new CREATED({
      message: SUCCESS_MESSAGE.SAVE_WAREHOUSE_SUCCESS,
      metadata: await WarehouseService.createAndUpdateWarehouse(warehouseList, createBy),
    }).send(res);
  };

  deleteWarehouse = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.DELETE_WAREHOUSE_SUCCESS,
      metadata: await WarehouseService.deleteWarehouse(req.body.warehouseCodeList),
    }).send(res);
  };

  getWarehouse = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.GET_WAREHOUSE_SUCCESS,
      metadata: await WarehouseService.getAllWarehouse(),
    }).send(res);
  };
}

export default new WarehouseController();
