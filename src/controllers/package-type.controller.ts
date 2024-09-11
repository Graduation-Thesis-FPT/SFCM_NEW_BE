import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import ItemTypeService from '../services/package-type.service';

class ItemTypeController {
  createItemType = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const ItemTypeList = res.locals.requestData;
    new CREATED({
      message: SUCCESS_MESSAGE.SAVE_ITEMTYPE_SUCCESS,
      metadata: await ItemTypeService.createAndUpdateItemType(ItemTypeList, createBy),
    }).send(res);
  };

  deleteItemType = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.DELETE_ITEMTYPE_SUCCESS,
      metadata: await ItemTypeService.deleteItemType(req.body.ItemTypeCodeList),
    }).send(res);
  };

  getItemType = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.GET_ITEMTYPE_SUCCESS,
      metadata: await ItemTypeService.getAllItemType(),
    }).send(res);
  };
}

export default new ItemTypeController();
