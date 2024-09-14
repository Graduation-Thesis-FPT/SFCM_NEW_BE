import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ContainerTariff } from '../../models/container-tariff.model';
import { BadRequestError } from '../../core/error.response';

const validateContainerTariff = (data: ContainerTariff) => {
  const blockSchema = Joi.object({
    ID: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã cước container không được để trống',
      'string.empty': 'Mã cước container không được để trống',
    }),
    NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên mô tả cước container không được để trống',
      'string.empty': 'Tên mô tả cước container không được để trống',
    }),
    CNTR_SIZE: Joi.number().required().positive().messages({
      'any.required': 'Kích cỡ container không được để trống',
      'string.empty': 'Kích cỡ container không được để trống',
    }),
    UNIT_PRICE: Joi.number().required().positive().messages({
      'number.positive': 'Đơn giá phải lớn hơn 0 #thêm',
      'number.base': 'Đơn giá không được để trống #thêm',
      'number.empty': 'Đơn giá không được để trống #thêm',
    }),
    VAT_RATE: Joi.number().required().messages({
      'number.base': 'Thuế VAT không được để trống #thêm',
      'number.empty': 'Thuế VAT không được để trống #thêm',
    }),
    VALID_FROM: Joi.date().optional().allow('').messages({
      'date.base': 'Hiệu lực từ không hợp lệ',
      'string.empty': 'Hiệu lực từ không được để trống',
    }),
    VALID_UNTIL: Joi.date().optional().allow('').messages({
      'date.base': 'Hiệu lực đến không hợp lệ',
      'string.empty': 'Hiệu lực đến không được để trống',
    }),
    STATUS: Joi.string().trim().allow(''),
  });

  return blockSchema.validate(data);
};

const validateContainerRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  const insertData = [];
  const updateData = [];

  if (insert) {
    for (const data of insert) {
      const { error, value } = validateContainerTariff(data);

      if (error) {
        throw new BadRequestError(error.message);
      }
      insertData.push(value);
    }
  }

  if (update) {
    for (const data of update) {
      const { error, value } = validateContainerTariff(data);

      if (error) {
        throw new BadRequestError(error.message);
      }
      updateData.push(value);
    }
  }
  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateContainerRequest };
