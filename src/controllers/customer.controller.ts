import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import CustomerService from '../services/customer.service';

class CustomerController {
  createCustomer = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const customerInfo = req.body.data;
    new CREATED({
      message: 'Tạo mới khách hàng thành công',
      metadata: await CustomerService.createCustomer(customerInfo, createBy),
    }).send(res);
  };
  updateCustomer = async (req: Request, res: Response) => {
    const updateBy = res.locals.user;
    const customerInfo = req.body.data;
    new SuccessResponse({
      message: 'Cập nhật khách hàng thành công',
      metadata: await CustomerService.updateCustomer(customerInfo, updateBy),
    }).send(res);
  };

  /////////////////////////////

  // createAndUpdateCustomer = async (req: Request, res: Response) => {
  //   const createBy = res.locals.user;
  //   const customerList = res.locals.body;
  //   new CREATED({
  //     message: SUCCESS_MESSAGE.SAVE_CUSTOMERTYPE_SUCCESS,
  //     metadata: await CustomerService.createAndUpdateCustomer(customerList, createBy),
  //   }).send(res);
  // };

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
