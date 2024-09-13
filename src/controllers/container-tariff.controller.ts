import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import ConatinerTariffService from '../services/container-tariff.service';

class ConatinerTariffController {
  createAndUpdateConatinerTariff = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const conatinerTariffList = res.locals.requestData;
    new CREATED({
      message: 'Lưu biểu cước container thành công!',
      metadata: await ConatinerTariffService.createAndUpdatecontainerTariff(
        conatinerTariffList,
        createBy,
      ),
    }).send(res);
  };

  deleteConatinerTariff = async (req: Request, res: Response) => {
    const { tariffID } = req.body;
    new SuccessResponse({
      message: 'Xóa thành công',
      metadata: await ConatinerTariffService.deletecontainerTariff(tariffID),
    }).send(res);
  };

  getConatinerTariff = async (req: Request, res: Response) => {
    new OK({
      message: 'Truy vấn thành công',
      metadata: await ConatinerTariffService.getAllcontainerTariff(),
    }).send(res);
  };
}

export default new ConatinerTariffController();
