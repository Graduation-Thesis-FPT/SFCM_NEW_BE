import { Request, Response } from 'express';
import { OK } from '../core/success.response';
import ExportOrderService from '../services/export-order.service';

class ExportOrderController {
  calculateExportOrder = async (req: Request, res: Response) => {
    const { voyageContainerPackageIds, pickupDate } = req.body;
    new OK({
      message: `Tính tiền`,
      metadata: await ExportOrderService.calculateExportOrder(
        voyageContainerPackageIds,
        pickupDate,
      ),
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

  getExportOrder = async (req: Request, res: Response) => {
    const id = req.params.id;

    new OK({
      message: `Tính tiền`,
      metadata: await ExportOrderService.getExportOrder(id),
    }).send(res);
  };

  getExportOrders = async (req: Request, res: Response) => {
    const consigneeId = req.query.consigneeId as string;
    const from = req.query.from as string;
    const to = req.query.to as string;

    new OK({
      message: `Tính tiền`,
      metadata: await ExportOrderService.getExportOrders({
        consigneeId,
        from,
        to,
      }),
    }).send(res);
  };
}

export default new ExportOrderController();
