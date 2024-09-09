import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { checkDuplicatedID } from '../../utils';
import { Gate } from '../../models/gate.model';
import { BadRequestError } from '../../core/error.response';

const validateInsertGate = (data: Gate) => {
  const gateSchema = Joi.object({
    GATE_CODE: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã cổng không được để trống #thêm',
    }),
    GATE_NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên cổng không được để trống #thêm',
    }),
    IS_IN_OUT: Joi.string().trim().valid('I', 'O').required().messages({
      'any.required': 'Trạng thái cổng không được để trống #thêm',
      'any.only': 'Trạng thái ra vào chỉ chấp nhận ký tự I hoặc O #thêm',
    }),
  });

  return gateSchema.validate(data);
};

const validateUpdateGate = (data: Gate) => {
  const gateSchema = Joi.object({
    GATE_CODE: Joi.string().required().messages({
      'any.required': 'Mã cổng không được để trống #cập nhật',
    }),
    GATE_NAME: Joi.string().trim().optional(),
    IS_IN_OUT: Joi.string().trim().valid('I', 'O').optional().messages({
      'any.only': 'Trạng thái ra vào chỉ chấp nhận ký tự I hoặc O #cập nhật',
    }),
  });

  return gateSchema.validate(data);
};

const validateGateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const gateInfo of insert) {
      const { error, value } = validateInsertGate(gateInfo);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const gateInfo of update) {
      const { error, value } = validateUpdateGate(gateInfo);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['GATE_CODE', 'GATE_NAME'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['GATE_CODE', 'GATE_NAME'], 'cập nhật');
  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateGateRequest };
