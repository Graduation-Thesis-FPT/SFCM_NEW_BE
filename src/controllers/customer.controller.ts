import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import CustomerService from '../services/customer.service';

class CustomerController {
  createAndUpdateCustomer = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const customerList = res.locals.requestData;

    new CREATED({
      message: SUCCESS_MESSAGE.SAVE_CUSTOMERTYPE_SUCCESS,
      metadata: await CustomerService.createAndUpdateCustomer(customerList, createBy),
    }).send(res);
  };

  deleteCustomer = async (req: Request, res: Response) => {
    const { CUSTOMER_CODE_LIST } = req.body;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.DELETE_CUSTOMERTYPE_SUCCESS,
      metadata: await CustomerService.deleteCustomer(CUSTOMER_CODE_LIST),
    }).send(res);
  };

  getCustomer = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.GET_CUSTOMERTYPE_SUCCESS,
      metadata: await CustomerService.getAllCustomer(),
    }).send(res);
  };
}

export default new CustomerController();
