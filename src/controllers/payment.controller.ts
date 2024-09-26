import { Request, Response } from 'express';
import { OK } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import paymentService from '../services/payment.service';
import { PaymentStatus } from '../models/payment.model';

class PaymentController {
  getAllPayments = async (req: Request, res: Response) => {
    const status = req.query.status as PaymentStatus;
    const orderId = req.query.orderId as string;
    const orderType = req.query.orderType as string;
    const searchQuery = req.query.searchQuery as string;

    new OK({
      message: SUCCESS_MESSAGE.GET_PAYMENT_SUCCESS,
      metadata: await paymentService.getAllPayments(status, orderId, orderType, searchQuery),
    }).send(res);
  };
}

export default new PaymentController();
