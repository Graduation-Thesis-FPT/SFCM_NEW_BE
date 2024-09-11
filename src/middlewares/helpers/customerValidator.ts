import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { Customer } from '../../models/customer.model';
import { checkDuplicatedID } from '../../utils';
import { BadRequestError } from '../../core/error.response';

const validateInsertCustomer = (data: Customer) => {
  const customerSchema = Joi.object({
    CUSTOMER_CODE: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã khách hàng không được để trống #thêm',
    }),
    CUSTOMER_NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên khách hàng không được để trống #thêm',
    }),
    CUSTOMER_TYPE_CODE: Joi.string().trim().required().messages({
      'any.required': 'Tên loại khách hàng không được để trống #thêm',
    }),
    ADDRESS: Joi.string().trim(),
    TAX_CODE: Joi.string()
      .trim()
      .regex(/^\d{10}(-\d{3})?$/)
      .required()
      .messages({
        'string.pattern.base':
          'Mã số thuế phải là 10 chữ số hoặc 10 chữ số theo sau là dấu gạch nối và 3 chữ số',
        'any.required': 'Mã số thuế không được để trống #thêm',
      }),
    EMAIL: Joi.string().trim().email().messages({
      'string.email': 'Email phải hợp lệ',
    }),
    IS_ACTIVE: Joi.boolean(),
  });

  return customerSchema.validate(data);
};

const validateUpdateCustomer = (data: Customer) => {
  const customerSchema = Joi.object({
    CUSTOMER_CODE: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã khách hàng không được để trống #cập nhật',
    }),
    CUSTOMER_NAME: Joi.string().trim().optional(),
    CUSTOMER_TYPE_CODE: Joi.string().trim().optional(),
    ADDRESS: Joi.string().trim().optional(),
    TAX_CODE: Joi.string()
      .trim()
      .regex(/^\d{10}(-\d{3})?$/)
      .optional()
      .messages({
        'string.pattern.base':
          'Mã số thuế phải là 10 chữ số hoặc 10 chữ số theo sau là dấu gạch nối và 3 chữ số',
      }),
    IS_ACTIVE: Joi.boolean().optional(),
    EMAIL: Joi.string()
      .trim()
      .email()
      .messages({
        'string.email': 'Email phải hợp lệ',
      })
      .optional(),
    USERNAME: Joi.string().trim().optional(),
  });

  return customerSchema.validate(data);
};

const validateCustomerRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const customerType of insert) {
      const { error, value } = validateInsertCustomer(customerType);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const customerType of update) {
      const { error, value } = validateUpdateCustomer(customerType);

      if (error) {
        // console.log(error.details);
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['CUSTOMER_CODE', 'TAX_CODE', 'EMAIL'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['CUSTOMER_CODE', 'TAX_CODE', 'EMAIL'], 'cập nhật');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateCustomerRequest };
