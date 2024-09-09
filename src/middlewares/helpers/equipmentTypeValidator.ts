import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { checkDuplicatedID } from '../../utils';
import { EquipmentType } from '../../models/equipment-type.model';
import { BadRequestError } from '../../core/error.response';

const validateInsertEquipType = (data: EquipmentType) => {
  const gateSchema = Joi.object({
    EQU_TYPE: Joi.string().uppercase().trim().max(10).required().messages({
      'any.required': 'Loại trang thiết bị không được để trống #thêm',
      'string.max': 'Loại trang thiết phải nhỏ hơn hoặc bằng 10 ký tự #thêm',
    }),
    EQU_TYPE_NAME: Joi.string().trim().max(50).required().messages({
      'any.required': 'Tên loại trang thiết bị không được để trống #thêm',
      'string.max': 'Tên loại trang thiết bị không được quá 50 ký tự #thêm',
    }),
  });

  return gateSchema.validate(data);
};

const validateUpdateEquipType = (data: EquipmentType) => {
  const gateSchema = Joi.object({
    EQU_TYPE: Joi.string().required().messages({
      'any.required': 'Loại trang thiết bị không được để trống #cập nhật',
    }),
    EQU_TYPE_NAME: Joi.string().trim().max(50).optional().messages({
      'string.max': 'Tên loại trang thiết bị không được quá 50 ký tự #cập nhật',
    }),
  });

  return gateSchema.validate(data);
};

const validateEquipTypeRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const equipInfo of insert) {
      const { error, value } = validateInsertEquipType(equipInfo);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const equipInfo of update) {
      const { error, value } = validateUpdateEquipType(equipInfo);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['EQU_TYPE', 'EQU_TYPE_NAME'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['EQU_TYPE', 'EQU_TYPE_NAME'], 'cập nhật');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateEquipTypeRequest };
