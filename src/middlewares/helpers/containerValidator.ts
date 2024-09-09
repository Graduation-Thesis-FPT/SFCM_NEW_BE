import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { Container } from '../../models/container.model';
import { BadRequestError } from '../../core/error.response';
import { checkDuplicatedID } from '../../utils';

const validateInsertContainer = (data: Container) => {
  const methodSchema = Joi.object({
    VOYAGEKEY: Joi.string().trim().required().messages({
      'any.required': 'Mã tàu không được để trống #thêm',
    }),
    BILLOFLADING: Joi.string().trim().allow(''),
    SEALNO: Joi.string().trim().allow(''),
    CNTRNO: Joi.string().required().pattern(new RegExp('^[a-zA-Z]{4}[0-9]{7}$')).messages({
      'any.required': 'Số container không được để trống #thêm',
      'string.pattern.base': 'Số container không hợp lệ #thêm',
      'string.empty': 'Số container không được để trống #thêm',
    }),
    CNTRSZTP: Joi.string().max(5).trim().required().messages({
      'any.required': 'Kích cỡ container không được để trống #thêm',
      'string.max': 'Kích cỡ container chỉ tối đa 5 ký tự #thêm',
      'string.empty': 'Kích cỡ container không được để trống #thêm',
    }),
    STATUSOFGOOD: Joi.boolean(),
    ITEM_TYPE_CODE: Joi.string().trim().required().messages({
      'any.required': 'Mã loại hàng hóa không được để trống #thêm',
    }),
    COMMODITYDESCRIPTION: Joi.string().trim().allow(''),
    CONSIGNEE: Joi.string().trim().required().messages({
      'any.required': 'Mã đại lý không được để trống #thêm',
    }),
  });

  return methodSchema.validate(data);
};

const validateUpdateContainer = (data: Container) => {
  const methodSchema = Joi.object({
    ROWGUID: Joi.string().trim().required().guid({ version: 'uuidv4' }).messages({
      'any.required': 'Mã container không được để trống #cập nhật',
      'string.guid': 'Mã container phải là UUID hợp lệ #cập nhật',
    }),
    VOYAGEKEY: Joi.string().trim(),
    BILLOFLADING: Joi.string().trim().optional().allow(''),
    SEALNO: Joi.string().trim().optional().allow(''),
    CNTRNO: Joi.string().pattern(new RegExp('^[a-zA-Z]{4}[0-9]{7}$')).optional().messages({
      'string.pattern.base': 'Số container không hợp lệ #cập nhật',
    }),
    CNTRSZTP: Joi.string().max(5).optional().messages({
      'string.max': 'Kích cỡ container chỉ tối đa 5 ký tự #cập nhật',
    }),
    STATUSOFGOOD: Joi.boolean().optional(),
    ITEM_TYPE_CODE: Joi.string().trim().optional(),
    COMMODITYDESCRIPTION: Joi.string().trim().optional().allow(''),
    CONSIGNEE: Joi.string().trim().optional(),
  });

  return methodSchema.validate(data);
};

const validateContainerRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const containerInfo of insert) {
      const { error, value } = validateInsertContainer(containerInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const containerInfo of update) {
      const { error, value } = validateUpdateContainer(containerInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['CNTRNO'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['CNTRNO'], 'cập nhật');
  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateContainerRequest };
