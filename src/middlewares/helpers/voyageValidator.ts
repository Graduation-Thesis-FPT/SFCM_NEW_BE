import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { Voyage } from '../../models/voyage.model';
import { BadRequestError } from '../../core/error.response';
import { checkDuplicatedID } from '../../utils';

const validateInsertVoyage = (data: Voyage) => {
  const methodSchema = Joi.object({
    ID: Joi.string().trim().required().messages({
      'any.required': 'Mã chuyến tàu không được để trống #thêm',
    }),
    VESSEL_NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên tàu không được để trống #thêm',
      'string.empty': 'Tên tàu không được để trống #thêm',
    }),
    ETA: Joi.date().required().messages({
      'any.required': 'Ngày tàu đến không được để trống #thêm',
      'date.base': 'Ngày tàu đến phải là một ngày hợp lệ #thêm',
    }),
  });

  return methodSchema.validate(data);
};

const validateUpdateVoyage = (data: Voyage) => {
  const methodSchema = Joi.object({
    ID: Joi.string().trim().required().messages({
      'any.required': 'Mã chuyến tàu không được để trống #cập nhật',
    }),
    VESSEL_NAME: Joi.string().trim().optional(),
    ETA: Joi.date().optional().messages({
      'date.base': 'Ngày tàu đến phải là một ngày hợp lệ #cập nhật',
    }),
  });

  return methodSchema.validate(data);
};

const validateVoyageRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const vesselInfo of insert) {
      const { error, value } = validateInsertVoyage(vesselInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const vesselInfo of update) {
      const { error, value } = validateUpdateVoyage(vesselInfo);

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

export { validateVoyageRequest };
