import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { Voyage } from '../../models/voyage.model';
import { BadRequestError } from '../../core/error.response';
import { checkDuplicatedID } from '../../utils';
import { PackageTariff } from '../../models/package-tariff.model';

const validateInsertPackageTariff = (data: PackageTariff) => {
  const methodSchema = Joi.object({
    NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên biểu cước kiện hàng không được để trống #thêm',
      'string.empty': 'Tên biểu cước kiện hàng không được để trống #thêm',
    }),
    VALID_FROM: Joi.date().required().messages({
      'any.required': 'Ngày hiệu lực biểu cước không được để trống #thêm',
      'date.base': 'Ngày hiệu lực biểu cước phải là một ngày hợp lệ #thêm',
    }),
    VALID_UNTIL: Joi.date().required().messages({
      'any.required': 'Ngày hết hạn biểu cước không được để trống #thêm',
      'date.base': 'Ngày hết hạn biểu cước phải là một ngày hợp lệ #thêm',
    }),
  });

  return methodSchema.validate(data);
};

const validateUpdatePackageTariff = (data: PackageTariff) => {
  const methodSchema = Joi.object({
    NAME: Joi.string().trim().messages({
      'any.required': 'Biểu cước kiện hàng không được để trống #thêm',
      'string.empty': 'Biểu cước kiện hàng không được để trống #thêm',
    }),
    VALID_FROM: Joi.date().messages({
      'any.required': 'Ngày hiệu lực biểu cước không được để trống #thêm',
      'date.base': 'Ngày hiệu lực biểu cước phải là một ngày hợp lệ #thêm',
    }),
    VALID_UNTIL: Joi.date().messages({
      'any.required': 'Ngày hết hạn biểu cước không được để trống #thêm',
      'date.base': 'Ngày hết hạn biểu cước phải là một ngày hợp lệ #thêm',
    }),
  });

  return methodSchema.validate(data);
};

const validatePackageTariff = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const vesselInfo of insert) {
      const { error, value } = validateInsertPackageTariff(vesselInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const vesselInfo of update) {
      const { error, value } = validateUpdatePackageTariff(vesselInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['ID'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['ID'], 'cập nhật');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validatePackageTariff };
