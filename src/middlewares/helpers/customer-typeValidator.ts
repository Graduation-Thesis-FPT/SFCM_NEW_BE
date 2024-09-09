import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { CustomerType } from '../../models/customer-type.model';
import { checkDuplicatedID } from '../../utils';
import { BadRequestError } from '../../core/error.response';

const validateInsertCustomerType = (data: CustomerType) => {
  const customerTypeSchema = Joi.object({
    CUSTOMER_TYPE_CODE: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã loại khách hàng không được để trống #thêm',
      'string.empty': 'Mã loại khách hàng không được để trống #thêm',
    }),
    CUSTOMER_TYPE_NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên loại khách hàng không được để trống #thêm',
    }),
  });

  return customerTypeSchema.validate(data);
};

const validateUpdateCustomerType = (data: CustomerType) => {
  const customerTypeSchema = Joi.object({
    CUSTOMER_TYPE_CODE: Joi.string().required().messages({
      'any.required': 'Mã loại khách hàng không được để trống #cập nhật',
    }),
    CUSTOMER_TYPE_NAME: Joi.string()
      .trim()
      .messages({
        'any.required': 'Tên loại khách hàng không được để trống #cập nhật',
      })
      .optional(),
  });

  return customerTypeSchema.validate(data);
};

const validateCustomerTypeRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const customerType of insert) {
      const { error, value } = validateInsertCustomerType(customerType);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const customerType of update) {
      const { error, value } = validateUpdateCustomerType(customerType);

      if (error) {
        // console.log(error.details);
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['CUSTOMER_TYPE_CODE', 'CUSTOMER_TYPE_NAME'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['CUSTOMER_TYPE_CODE', 'CUSTOMER_TYPE_NAME'], 'cập nhật');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateCustomerTypeRequest };
