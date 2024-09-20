import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import ImportOrderService from '../services/import-order.service';
import { ContainerImLoad } from '../repositories/import-order.repo';

class ImportOrderController {
  loadImportVesselAnhCustomer = async (req: Request, res: Response) => {
    new OK({
      message: `Truy vấn dữ liệu thành công!`,
      metadata: await ImportOrderService.getAllVoyageWithCustomerCanImportOrder(),
    }).send(res);
  };

  loadImportContainer = async (req: Request, res: Response) => {
    const obj: ContainerImLoad = {
      SHIPPER_ID: req.query.SHIPPER_ID ? (req.query.SHIPPER_ID as string) : '',
      VOYAGE_ID: req.query.VOYAGE_ID ? (req.query.VOYAGE_ID as string) : '',
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
