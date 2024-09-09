import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { checkDuplicatedID } from '../../utils';
import { Equipment } from '../../models/equipment.models';
import { BadRequestError } from '../../core/error.response';

const validateInsertEquipment = (data: Equipment) => {
  const equipmentSchema = Joi.object({
    EQU_CODE: Joi.string().uppercase().trim().max(10).required().messages({
      'any.required': 'Mã trang thiết bị không được để trống #thêm',
      'string.max': 'Mã trang thiết phải nhỏ hơn hoặc bằng 10 ký tự #thêm',
      'string.empty': 'Mã trang thiết bị không được để trống #thêm',
    }),
    EQU_TYPE: Joi.string().trim().required().messages({
      'any.required': 'Loại trang thiết bị không được để trống #thêm',
    }),
    EQU_CODE_NAME: Joi.string().trim().max(50).required().messages({
      'any.required': 'Tên trang thiết bị không được để trống #thêm',
      'string.max': 'Tên trang thiết bị không được quá 50 ký tự #thêm',
    }),
    WAREHOUSE_CODE: Joi.string().trim().empty('').default(null),
  });

  return equipmentSchema.validate(data);
};

const validateUpdateEquipment = (data: Equipment) => {
  const equipmentSchema = Joi.object({
    EQU_CODE: Joi.string().trim().max(10).required().messages({
      'any.required': 'Mã trang thiết bị không được để trống #thêm',
      'string.max': 'Mã trang thiết phải nhỏ hơn hoặc bằng 10 ký tự #thêm',
    }),
    EQU_TYPE: Joi.string().trim().optional(),
    EQU_CODE_NAME: Joi.string().trim().max(50).messages({
      'string.max': 'Tên trang thiết bị không được quá 50 ký tự #thêm',
    }),
    WAREHOUSE_CODE: Joi.string().trim().empty('').default(null),
  });

  return equipmentSchema.validate(data);
};

const validateEquipmentRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const equipInfo of insert) {
      const { error, value } = validateInsertEquipment(equipInfo);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const equipInfo of update) {
      const { error, value } = validateUpdateEquipment(equipInfo);

      if (error) {
        // console.log(error.details);
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['EQU_CODE'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['EQU_CODE'], 'cập nhật');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateEquipmentRequest };
