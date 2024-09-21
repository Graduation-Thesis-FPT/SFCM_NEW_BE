import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import ItemTypeService from '../services/package-type.service';
import PackageTariffService from '../services/package-tariff.service';

class PackageTariffController {
  createPackageTariff = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const ItemTypeList = res.locals.requestData;
    new CREATED({
      message: `Tạo mới thành công`,
      metadata: await PackageTariffService.createAndUpdatePackageTariff(ItemTypeList, createBy),
    }).send(res);
  };

  deletePackageTariff = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: `Xóa thành công`,
      metadata: await PackageTariffService.deleteIPackageTariff(req.body.packageTariffCode),
    }).send(res);
  };

  getPackageTariff = async (req: Request, res: Response) => {
    new OK({
      message: `Truy vấn thành công`,
      metadata: await PackageTariffService.getAllPackageTariff(),
    }).send(res);
  };
}

export default new PackageTariffController();
