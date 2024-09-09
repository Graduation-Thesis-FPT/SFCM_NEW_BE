import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../../core/error.response';
import { DiscountTariff } from '../../models/discount-tariff.model';

const validateInsertDiscountTariff = (data: DiscountTariff) => {
  const tariffSchema = Joi.object({
    ITEM_TYPE_CODE: Joi.string().trim().required().messages({
      'any.required': 'Mã loại hàng hóa không được để trống #thêm',
      'string.empty': 'Mã loại hàng hóa không được để trống #thêm',
    }),
    METHOD_CODE: Joi.string().trim().required().messages({
      'any.required': 'Mã phương án không được để trống #thêm',
      'string.empty': 'Mã phương án không được để trống #thêm',
    }),
    CUSTOMER_CODE: Joi.string().trim().required().messages({
      'any.required': 'Mã khách hàng không được để trống #thêm',
      'string.empty': 'Mã khách hàng không được để trống #thêm',
    }),
    TRF_TEMP_CODE: Joi.string().required().trim().allow('').messages({
      'any.required': 'Mã mẫu biểu cước không được để trống #thêm',
      'string.empty': 'Mã mẫu biểu cước không được để trống #thêm',
    }),
    TRF_CODE: Joi.string().trim().uppercase().required().messages({
      'any.required': 'Mã biểu cước không được để trống #thêm',
      'string.empty': 'Mã biểu cước không được để trống #thêm',
    }),
    TRF_DESC: Joi.string().trim().allow('').messages({
      'string.empty': 'Mô tả mã biểu cước không được để trống #thêm',
    }),
    AMT_CBM: Joi.number().min(0).required().messages({
      'any.required': 'Tổng tiền không được để trống #thêm',
      'number.min': 'Tổng tiền phải là số dương #thêm',
      'number.base': 'Tổng tiền phải là một số #thêm',
    }),
    VAT: Joi.number().min(0).allow('').messages({
      'number.min': 'VAT phải là số dương #thêm',
      'number.base': 'VAT phải là một số #thêm',
    }),
    INCLUDE_VAT: Joi.boolean(),
  });

  return tariffSchema.validate(data);
};

const validateUpdateDiscountTariff = (data: DiscountTariff) => {
  const tariffSchema = Joi.object({
    ROWGUID: Joi.string().trim().required().messages({
      'any.required': 'ROWGUID không được để trống #cập nhật',
    }),
    TRF_CODE: Joi.string().trim().uppercase().messages({
      'string.empty': 'Mã biểu cước không được để trống #cập nhật',
    }),
    TRF_DESC: Joi.string().trim().allow('').messages({
      'string.empty': 'Mô tả mã biểu cước không được để trống #cập nhật',
    }),
    CUSTOMER_CODE: Joi.string().trim().messages({
      'string.empty': 'Mã khách hàng không được để trống #thêm',
    }),
    METHOD_CODE: Joi.string().trim().messages({
      'string.empty': 'Mã phương án không được để trống #cập nhật',
    }),
    ITEM_TYPE_CODE: Joi.string().trim().messages({
      'string.empty': 'Mã loại hàng hóa không được để trống #cập nhật',
    }),
    AMT_CBM: Joi.number().min(0).messages({
      'number.empty': 'Tổng tiền không được để trống #cập nhật',
      'number.min': 'Tổng tiền phải là số dương #cập nhật',
      'number.base': 'Tổng tiền phải là một số #cập nhật',
    }),
    VAT: Joi.number().min(0).allow('').messages({
      'number.min': 'VAT phải là số dương #cập nhật',
      'number.base': 'VAT phải là một số #cập nhật',
    }),
    INCLUDE_VAT: Joi.boolean(),
  });

  return tariffSchema.validate(data);
};

const validateDiscountTariffRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const tariff of insert) {
      const { error, value } = validateInsertDiscountTariff(tariff);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const tariff of update) {
      const { error, value } = validateUpdateDiscountTariff(tariff);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateDiscountTariffRequest };
