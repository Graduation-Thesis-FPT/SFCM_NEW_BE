import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../../core/error.response';
import { TariffCode } from '../../models/tariff-code.model';

const validateInsertTariffCode = (data: TariffCode) => {
  const tariffCodeSchema = Joi.object({
    TRF_CODE: Joi.string().trim().uppercase().required().messages({
      'any.required': 'Mã biểu cước không được để trống #thêm',
      'string.empty': 'Mã biểu cước không được để trống #thêm',
    }),
    TRF_DESC: Joi.string().trim().required().messages({
      'any.required': 'Mô tả mã biểu cước không được để trống #thêm',
      'string.empty': 'Mô tả mã biểu cước không được để trống #thêm',
    }),
  });

  return tariffCodeSchema.validate(data);
};

const validateUpdateTariffCode = (data: TariffCode) => {
  const tariffCodeSchema = Joi.object({
    TRF_CODE: Joi.string().trim().required().messages({
      'any.required': 'Mã biểu cước không được để trống #cập nhật',
      'string.empty': 'Mã biểu cước không được để trống #cập nhật',
    }),
    TRF_DESC: Joi.string().trim().optional().messages({
      'string.empty': 'Mô tả mã biểu cước không được để trống #thêm',
    }),
  });

  return tariffCodeSchema.validate(data);
};

const validateTariffCodeRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const tariffCode of insert) {
      const { error, value } = validateInsertTariffCode(tariffCode);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const tariffCode of update) {
      const { error, value } = validateUpdateTariffCode(tariffCode);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateTariffCodeRequest };
