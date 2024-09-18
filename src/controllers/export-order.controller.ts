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
}

export default new ExportOrderController();
