import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { Method } from '../../models/method.model';
import { checkDuplicatedID } from '../../utils';
import { BadRequestError } from '../../core/error.response';

const validateInsertMethod = (data: Method) => {
  const methodSchema = Joi.object({
    METHOD_CODE: Joi.string().uppercase().trim().required().messages({
      'string.empty': 'Mã phương án không được để trống #thêm',
      'any.required': 'Mã phương án không được để trống #thêm',
    }),
    METHOD_NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên phương án không được để trống #thêm',
      'string.empty': 'Tên phương án không được để trống #thêm',
    }),
    IS_IN_OUT: Joi.string().trim().valid('I', 'O').required().messages({
      'any.required': 'Trạng thái ra vào không được trống',
      'any.only': 'Trạng thái ra vào chỉ chấp nhận ký tự I hoặc O #thêm',
    }),
    IS_SERVICE: Joi.boolean(),
  });

  return methodSchema.validate(data);
};

const validateUpdateMethod = (data: Method) => {
  const methodSchema = Joi.object({
    METHOD_CODE: Joi.string().required().messages({
      'any.required': 'Loại trang thiết bị không được để trống #cập nhật',
    }),
    METHOD_NAME: Joi.string().trim().optional(),
    IS_IN_OUT: Joi.string()
      .trim()
      .valid('I', 'O')
      .messages({
        'any.only': 'Trạng thái ra vào chỉ chấp nhận I hoặc O #thêm',
      })
      .optional(),
    IS_SERVICE: Joi.optional(),
  });

  return methodSchema.validate(data);
};

const validateMethodRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const methodInfo of insert) {
      const { error, value } = validateInsertMethod(methodInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const methodInfo of update) {
      const { error, value } = validateUpdateMethod(methodInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['METHOD_CODE', 'METHOD_NAME'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['METHOD_CODE', 'METHOD_NAME'], 'cập nhật');
  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateMethodRequest };
