import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../../core/error.response';
import { Tariff } from '../../models/tariff.model';

const validateInsertUser = (data: Tariff) => {
  const useSchema = Joi.object({
    USERNAME: Joi.string().trim().required().messages({
      'string.empty': 'Tên người dùng không được để trống',
    }),
    PASSWORD: Joi.string().allow(null).trim(),
    ROLE_ID: Joi.string().trim().required().messages({
      'string.empty': 'Mã chức vụ không được để trống',
    }),
    FULLNAME: Joi.string().allow(null).trim(),
    BIRTHDAY: Joi.date().allow(null),
    ADDRESS: Joi.string().allow(null).trim(),
    TELEPHONE: Joi.string().allow(null).trim(),
    EMAIL: Joi.string().allow(null).trim().email(),
    IS_ACTIVE: Joi.boolean().required(),
    REMARK: Joi.string().allow(null).trim(),
  });

  return useSchema.validate(data);
};

const validateUpdateUser = (data: Tariff) => {
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

const validateTariffRequest = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = validateInsertUser(req.body);

  if (error) {
    throw new BadRequestError(error.message);
  }

  res.locals.requestData = { insert: value };
  next();
};

export { validateTariffRequest };
