import { Request, Response } from 'express';
import { SUCCESS_MESSAGE } from '../constants';
import { OK } from '../core/success.response';
import CustomerOrderService from '../services/customer-order.service';
import { DateRange } from '../models/deliver-order.model';
import ImportExportOrderService from '../services/order.service';

class CustomerOrderController {
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

  getImportedOrders = async (req: Request, res: Response) => {
    const status = req.query.status as string;
    const user = res.locals.user;
    const filterDate = req.query as object as DateRange;
    new OK({
      message: SUCCESS_MESSAGE.GET_IMPORTED_ORDERS_SUCCESS,
      metadata: await CustomerOrderService.getImportedOrdersByStatus(status, user, filterDate),
    }).send(res);
  };

  getExportedOrders = async (req: Request, res: Response) => {
    const user = res.locals.user;
    const status = req.query.status as string;
    const filterDate = req.query as object as DateRange;
    new OK({
      message: SUCCESS_MESSAGE.GET_EXPORTED_ORDERS_SUCCESS,
      metadata: await CustomerOrderService.getExportedOrdersByStatus(status, user, filterDate),
    }).send(res);
  };

  getOrderByOrderNo = async (req: Request, res: Response) => {
    const orderNo = req.params.orderNo;
    new OK({
      message: SUCCESS_MESSAGE.GET_ORDER_SUCCESS,
      metadata: await CustomerOrderService.getOrderByOrderNo(orderNo),
    }).send(res);
  };
}

export default new CustomerOrderController();
