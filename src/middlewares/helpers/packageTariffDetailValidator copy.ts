import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../../core/error.response';
import { checkDuplicatedID } from '../../utils';
import { PackageTariffDetail } from '../../models/package-tariff-detail.model';

const validateInsertPackageTariffDetail = (data: PackageTariffDetail) => {
  const methodSchema = Joi.object({
    PACKAGE_TARIFF_ID: Joi.string().trim().required().messages({
      'any.required': 'Mã biểu cước kiện hàng không được để trống #thêm',
      'string.empty': 'Mã biểu cước kiện hàng không được để trống #thêm',
    }),
    PACKAGE_TYPE_ID: Joi.string().trim().required().messages({
      'any.required': 'Loại kiện hàng không được để trống #thêm',
      'string.empty': 'Loại kiện hàng không được để trống #thêm',
    }),
    PACKAGE_TARIFF_DESCRIPTION: Joi.string().trim().messages({
      'any.required': 'Mô tả biểu cước không được để trống #thêm',
      'string.empty': 'Mô tả biểu cước không được để trống #thêm',
    }),
    UNIT: Joi.string().trim().required().messages({
      'any.required': 'Đơn vị kiện hàng không được để trống #thêm',
      'string.empty': 'Đơn vị kiện hàng không được để trống #thêm',
    }),
    UNIT_PRICE: Joi.number().required().messages({
      'any.required': 'Đơn giá biểu cước không được để trống #thêm',
      'number.empty': 'Đơn giá biểu cước không được để trống #thêm',
    }),
    VAT_RATE: Joi.number().required().messages({
      'any.required': 'Thuế không được để trống #thêm',
      'number.empty': 'Thuế không được để trống #thêm',
    }),
    STATUS: Joi.string().valid('ACTIVE', 'INACTIVE').messages({
      'any.required': 'Trạng thái không được để trống #thêm',
      'string.empty': 'Trạng thái không được để trống #thêm',
    }),
  });

  return methodSchema.validate(data);
};

const validateUpdatePackageTariffDetail = (data: PackageTariffDetail) => {
  const methodSchema = Joi.object({
    ROWGUID: Joi.string().trim().required().messages({
      'any.required': 'ROWGUID không được để trống #cập nhật',
      'string.empty': 'ROWGUID không được để trống #cập nhật',
    }),
    PACKAGE_TARIFF_ID: Joi.string().trim().messages({
      'any.required': 'Mã biểu cước kiện hàng không được để trống #thêm',
      'string.empty': 'Mã biểu cước kiện hàng không được để trống #thêm',
    }),
    PACKAGE_TYPE_ID: Joi.string().trim().messages({
      'any.required': 'Loại kiện hàng không được để trống #thêm',
      'string.empty': 'Loại kiện hàng không được để trống #thêm',
    }),
    PACKAGE_TARIFF_DESCRIPTION: Joi.string().trim().messages({
      'any.required': 'Mô tả biểu cước không được để trống #thêm',
      'string.empty': 'Mô tả biểu cước không được để trống #thêm',
    }),
    UNIT: Joi.string().trim().messages({
      'any.required': 'Đơn vị kiện hàng không được để trống #thêm',
      'string.empty': 'Đơn vị kiện hàng không được để trống #thêm',
    }),
    UNIT_PRICE: Joi.number().messages({
      'any.required': 'Đơn giá biểu cước không được để trống #thêm',
      'number.empty': 'Đơn giá biểu cước không được để trống #thêm',
    }),
    VAT_RATE: Joi.number().messages({
      'any.required': 'Thuế không được để trống #thêm',
      'number.empty': 'Thuế không được để trống #thêm',
    }),
    STATUS: Joi.string().valid('ACTIVE', 'INACTIVE').messages({
      'any.required': 'Trạng thái không được để trống #thêm',
      'string.empty': 'Trạng thái không được để trống #thêm',
    }),
  });

  return methodSchema.validate(data);
};

const validatePackageTariffDetail = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const vesselInfo of insert) {
      const { error, value } = validateInsertPackageTariffDetail(vesselInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const vesselInfo of update) {
      const { error, value } = validateUpdatePackageTariffDetail(vesselInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['PACKAGE_TYPE_ID'], 'thêm mới');
  // if (update) checkDuplicatedID(update, ['ID'], 'cập nhật');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validatePackageTariffDetail };
