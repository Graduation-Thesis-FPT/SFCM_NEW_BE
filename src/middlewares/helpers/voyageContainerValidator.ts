import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { VoyageContainer } from '../../models/voyage-container.model';
import { BadRequestError } from '../../core/error.response';
import { checkDuplicatedID } from '../../utils';

const validateInsertVoyageContainer = (data: VoyageContainer) => {
  const methodSchema = Joi.object({
    VOYAGE_ID: Joi.string().trim().required().messages({
      'any.required': 'Mã tàu không được để trống #thêm',
    }),
    SEAL_NO: Joi.string().trim().allow(''),
    CNTR_NO: Joi.string().required().pattern(new RegExp('^[a-zA-Z]{4}[0-9]{7}$')).messages({
      'any.required': 'Số container không được để trống #thêm',
      'string.pattern.base': 'Số container không hợp lệ #thêm',
      'string.empty': 'Số container không được để trống #thêm',
    }),
    CNTR_SIZE: Joi.number().required().messages({
      'any.required': 'Kích cỡ container không được để trống #thêm',
      'number.empty': 'Kích cỡ container không được để trống #thêm',
    }),
    STATUS: Joi.string().default('PENDING'),
    NOTE: Joi.string().trim().allow(''),
    SHIPPER_ID: Joi.string().trim().required().messages({
      'any.required': 'Mã đại lý không được để trống #thêm',
    }),
  });

  return methodSchema.validate(data);
};

const validateUpdateVoyageContainer = (data: VoyageContainer) => {
  const methodSchema = Joi.object({
    ID: Joi.string().trim().required().messages({
      'any.required': 'Mã container không được để trống #cập nhật',
    }),
    VOYAGE_ID: Joi.string().trim(),
    SEAL_NO: Joi.string().trim().optional().allow(''),
    CNTR_NO: Joi.string().pattern(new RegExp('^[a-zA-Z]{4}[0-9]{7}$')).optional().messages({
      'string.pattern.base': 'Số container không hợp lệ #cập nhật',
    }),
    CNTR_SIZE: Joi.number().optional().messages({
      'string.max': 'Kích cỡ container chỉ tối đa 5 ký tự #cập nhật',
    }),
    STATUS: Joi.string().optional(),
    NOTE: Joi.string().trim().optional().allow(''),
    SHIPPER_ID: Joi.string().trim().optional(),
  });

  return methodSchema.validate(data);
};

const validateVoyageContainerRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const containerInfo of insert) {
      const { error, value } = validateInsertVoyageContainer(containerInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const containerInfo of update) {
      const { error, value } = validateUpdateVoyageContainer(containerInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['CNTR_NO'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['CNTR_NO'], 'cập nhật');
  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateVoyageContainerRequest };
