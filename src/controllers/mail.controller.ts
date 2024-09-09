import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import JobQuantityCheckService from '../services/job-quantity-check.service';
import EmailService from '../services/email.service';
import { checkIsValidExportPallet } from '../repositories/delivery-order.repo';
import PalletService from '../services/pallet.service';

class mailController {
  testSendMail = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.GET_DATA_SUCCESS,
      metadata: await EmailService.sendEmailInvoice(req.body),
    }).send(res);
  };

  testPalletValid = async (req: Request, res: Response) => {
    console.log(req.body.PALLET_NO);
    const result = await PalletService.testValidPallet(req.body.PALLET_NO);
    res.json({
      result,
    });
  };
}

export default new mailController();
