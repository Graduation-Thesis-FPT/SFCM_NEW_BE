import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import ItemTypeService from '../services/package-type.service';
import PackageTariffService from '../services/package-tariff.service';
import PackageTariffDetailService from '../services/package-tariff-detail.service';

class PackageTariffController {
  createPackageTariffDetail = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const ItemTypeList = res.locals.requestData;
    new CREATED({
      message: `Tạo mới thành công`,
      metadata: await PackageTariffDetailService.createAndUpdatePackageTariffDetail(
        ItemTypeList,
        createBy,
      ),
    }).send(res);
  };

  deletePackageTariffDetail = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: `Xóa thành công`,
      metadata: await PackageTariffDetailService.deleteIPackageTariffDetail(
        req.body.packageTariffDetailCode,
      ),
    }).send(res);
  };

  getPackageTariffDetail = async (req: Request, res: Response) => {
    new OK({
      message: `Truy vấn thành công`,
      metadata: await PackageTariffDetailService.getAllPackageTariffDetail(),
    }).send(res);
  };
}

export default new PackageTariffController();
