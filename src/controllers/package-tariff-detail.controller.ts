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
    const packageTariffId = req.query.packageTariffId as string;
    new CREATED({
      message: `Tạo mới thành công`,
      metadata: await PackageTariffDetailService.createAndUpdatePackageTariffDetail(
        ItemTypeList,
        createBy,
        packageTariffId,
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
    const PACKAGE_TARIFF_ID = req.query.PACKAGE_TARIFF_ID as string;
    new OK({
      message: `Truy vấn thành công`,
      metadata: await PackageTariffDetailService.getPackageTariffDetailByFK(PACKAGE_TARIFF_ID),
    }).send(res);
  };
}

export default new PackageTariffController();
