import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { Package } from '../../models/packageMnfLd.model';
import { BadRequestError } from '../../core/error.response';

const validateData = (data: Package) => {
  const methodSchema = Joi.object({
    HOUSE_BILL: Joi.string().trim().uppercase().required().messages({
      'string.empty': 'Số House Bill không được để trống',
    }),
    ROWGUID: Joi.string().trim().allow('').optional(),
    DECLARE_NO: Joi.string().trim().allow('').optional(),
    CONTAINER_ID: Joi.string().trim().required().messages({
      'string.empty': 'REF_CONTAINER không được để trống',
    }),
    NOTE: Joi.string().trim().allow('').optional(),
    ITEM_TYPE_CODE: Joi.string().trim().required().messages({
      'string.empty': 'Loại hàng hóa không được để trống',
    }),
    PACKAGE_UNIT_CODE: Joi.string().trim().required().messages({
      'string.empty': 'Đơn vị tính hàng hóa không được để trống',
    }),
    CARGO_PIECE: Joi.number().positive().greater(0).messages({
      'number.positive': 'Số lượng hàng hóa phải là số dương',
      'number.base': 'Số lượng hàng hóa không được để trống!',
    }),
    CBM: Joi.number().positive().required().messages({
      'number.base': 'Số khối không được để trống!',
      'number.positive': 'Số khối phải là số dương',
      'string.empty': 'Số khối không được để trống',
    }),
    JOB_TYPE: Joi.string().trim().allow('').optional(),
    TIME_IN: Joi.date().optional().allow('').messages({
      'date.base': 'Thời gian vào không hợp lệ',
      'string.empty': 'Thời gian vào không được để trống',
    }),
    TIME_OUT: Joi.date().optional().allow('').messages({
      'date.base': 'Thời gian ra không hợp lệ',
      'string.empty': 'Thời gian ra không được để trống',
    }),
  });

  return methodSchema.validate(data);
};

const validatePackageRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const data of insert) {
      const { error, value } = validateData(data);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const data of update) {
      const { error, value } = validateData(data);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validatePackageRequest };
