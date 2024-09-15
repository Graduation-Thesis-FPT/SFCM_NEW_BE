import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import ImportOrderService from '../services/import-order.service';
import { ContainerImLoad } from '../repositories/import-order.repo';

class ImportOrderController {
  loadImportVesselAnhCustomer = async (req: Request, res: Response) => {
    new OK({
      message: `Truy vấn dữ liệu thành công!`,
      metadata: await ImportOrderService.loadImportVesselAnhCustomer(),
    }).send(res);
  };

  loadImportContainer = async (req: Request, res: Response) => {
    const obj: ContainerImLoad = {
      SHIPPER_ID: req.body.SHIPPER_ID ? req.body.SHIPPER_ID : '',
      VOYAGE_ID: req.body.VOYAGE_ID ? req.body.VOYAGE_ID : '',
    };
    new OK({
      message: `Truy vấn dữ liệu thành công!`,
      metadata: await ImportOrderService.loadImportContainer(obj),
    }).send(res);
  };

  calculateImport = async (req: Request, res: Response) => {
    const arrayContID = req.body.arrayContID;
    new OK({
      message: `Tính tiền`,
      metadata: await ImportOrderService.calculateImport(arrayContID),
    }).send(res);
  };
}

export default new ImportOrderController();
