import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import ImportOrderService from '../services/import-order.service';
import { ContainerImLoad, wherePaymentObj } from '../repositories/import-order.repo';

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
  saveImportOrder = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const arrayContID = req.body.arrayContID;
    const paymentInfo = req.body.paymentInfo;
    const note = req.body.note;
    new OK({
      message: `Lưu lệnh`,
      metadata: await ImportOrderService.saveImportOrder(
        {
          arrayContID: arrayContID,
          paymentInfo: paymentInfo,
          note: note,
        },
        createBy,
      ),
    }).send(res);
  };

  loadPaymentConfirm = async (req: Request, res: Response) => {
    let rule: wherePaymentObj = {
      fromDate: new Date(),
      toDate: new Date(),
    };
    if (req.query.from && req.query.to) {
      rule.fromDate = new Date(req.query?.from as string);
      rule.toDate = new Date(req.query?.to as string);
    }
    if (req.query.STATUS) {
      rule.STATUS =
        String(req.query.STATUS) == 'PENDING'
          ? 'PENDING'
          : String(req.query.STATUS) == 'PAID'
            ? 'PAID'
            : 'CANCELLED';
    }
    new OK({
      message: `Truy vấn dữ liệu thành công!`,
      metadata: await ImportOrderService.loadPaymentConfirm(rule),
    }).send(res);
  };

  paymentComplete = async (req: Request, res: Response) => {
    new OK({
      message: `Xác nhận thanh toán thành công!`,
      metadata: await ImportOrderService.paymentComplete({
        ID: req.body.ID,
        TYPE: req.body.TYPE == 'NK' ? 'NK' : 'XK',
      }),
    }).send(res);
  };
}

export default new ImportOrderController();
