import { Request, Response } from 'express';
import { OK } from '../core/success.response';
import ExportOrderService from '../services/export-order.service';

class ExportOrderController {
  calculateExport = async (req: Request, res: Response) => {
    const { voyageContainerPackageIds, pickupDate } = req.body;
    new OK({
      message: `Tính tiền`,
      metadata: await ExportOrderService.calculateExport(voyageContainerPackageIds, pickupDate),
    }).send(res);
  };
  createExportOrder = async (req: Request, res: Response) => {
    const data = req.body;
    const creator = res.locals.user;

    new OK({
      message: `Tính tiền`,
      metadata: await ExportOrderService.createExportOrder(data, creator),
    }).send(res);
  };
}

export default new ExportOrderController();
