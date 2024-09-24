import { Request, Response } from 'express';
import { OK } from '../core/success.response';
import ImportExportOrderService from '../services/order.service';

class ImportExportOrderController {
  getImportExportOrders = async (req: Request, res: Response) => {
    const consigneeId = req.query.consigneeId as string;
    const shipperId = req.query.shipperId as string;
    const from = req.query.from as string;
    const to = req.query.to as string;
    const returnImport =
      req.query.returnImport !== undefined ? (req.query.returnImport as string) === 'true' : true;
    const returnExport =
      req.query.returnExport !== undefined ? (req.query.returnExport as string) === 'true' : true;

    new OK({
      message: `Lấy danh sách toàn bộ đơn hàng`,
      metadata: await ImportExportOrderService.getImportExportOrders({
        consigneeId,
        shipperId,
        from,
        to,
        returnImport,
        returnExport,
      }),
    }).send(res);
  };
}

export default new ImportExportOrderController();
