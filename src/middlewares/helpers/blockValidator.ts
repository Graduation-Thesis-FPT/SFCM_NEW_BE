import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { checkDuplicatedID } from '../../utils';
import { BadRequestError } from '../../core/error.response';
import { Block } from '../../models/block.model';

const validateInsertBlock = (data: Block) => {
  const blockSchema = Joi.object({
    WAREHOUSE_CODE: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã kho không được để trống #thêm',
      'string.empty': 'Mã kho không được để trống #thêm',
      'string.base': 'Mã kho không được để trống #thêm',
    }),
    BLOCK_CODE: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã dãy không được để trống #thêm',
      'string.empty': 'Mã dãy không được để trống #thêm',
      'string.base': 'Mã dãy không được để trống #thêm',
    }),
    BLOCK_NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên dãy không được để trống #thêm',
      'string.empty': 'Tên dãy không được để trống #thêm',
      'string.base': 'Tên dãy không được để trống #thêm',
    }),
    TIER_COUNT: Joi.number().required().positive().messages({
      'number.positive': 'Số tầng phải lớn hơn 0 #thêm',
      'number.base': 'Số tầng không được để trống #thêm',
      'number.empty': 'Số tầng không được để trống #thêm',
    }),
    SLOT_COUNT: Joi.number().required().positive().messages({
      'number.positive': 'Số cột phải lớn hơn 0 #thêm',
      'number.base': 'Số cột không được để trống #thêm',
      'number.empty': 'Số cột không được để trống #thêm',
    }),
    BLOCK_WIDTH: Joi.number().required().positive().messages({
      'number.positive': 'Chiều rộng của dãy phải lớn hơn 0 #thêm',
      'number.empty': 'Chiều rộng của dãy không được để trống #thêm',
      'any.required': 'Chiều rộng của dãy không được để trống #thêm',
    }),
    BLOCK_HEIGHT: Joi.number().required().positive().messages({
      'number.positive': 'Chiều cao dãy phải lớn hơn 0 #thêm',
      'number.empty': 'Chiều cao dãy không được để trống #thêm',
      'any.required': 'Chiều cao dãy không được để trống #thêm',
    }),
    BLOCK_LENGTH: Joi.number().required().positive().messages({
      'number.positive': 'Chiều dài dãy phải lớn hơn 0 #thêm',
      'number.empty': 'Chiều dài dãy không được để trống #thêm',
      'any.required': 'Chiều dài dãy không được để trống #thêm',
    }),
  });

  return blockSchema.validate(data);
};

const validateUpdateBlock = (data: Block) => {
  const blockSchema = Joi.object({
    BLOCK_CODE: Joi.string().trim().required(),
    WAREHOUSE_CODE: Joi.string().trim().optional(),
    BLOCK_NAME: Joi.optional(),
    TIER_COUNT: Joi.number()
      .positive()
      .messages({
        'number.positive': 'Số tầng phải lớn hơn 0 #cập nhật',
        'number.base': 'Số tầng không được để trống #cập nhật',
      })
      .optional(),
    SLOT_COUNT: Joi.number()
      .positive()
      .messages({
        'number.positive': 'Số ô phải lớn hơn 0 #cập nhật',
        'number.base': 'Số ô không được để trống #cập nhật',
      })
      .optional(),
    BLOCK_WIDTH: Joi.number()
      .positive()
      .messages({
        'number.positive': 'Chiều rộng phải lớn hơn 0 #cập nhật',
        'number.base': 'Chiều rộng không được để trống #cập nhật',
      })
      .optional(),
    BLOCK_HEIGHT: Joi.number()
      .positive()
      .messages({
        'number.positive': 'Chiều cao phải lớn hơn 0 #cập nhật',
        'number.base': 'Chiều cao không được để trống #cập nhật',
      })
      .optional(),
    BLOCK_LENGTH: Joi.number()
      .positive()
      .messages({
        'number.positive': 'Chiều dài phải lớn hơn 0 #cập nhật',
        'number.base': 'Chiều dài không được để trống #cập nhật',
      })
      .optional(),
  });

  return blockSchema.validate(data);
};

const validateBlockRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;
  if (insert.length === 0 && update.length === 0) {
    throw new BadRequestError();
  }
  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const blockInfo of insert) {
      const { error, value } = validateInsertBlock(blockInfo);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const blockInfo of update) {
      const { error, value } = validateUpdateBlock(blockInfo);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }
  if (insert) checkDuplicatedID(insert, ['BLOCK_CODE', 'BLOCK_NAME'], 'Thêm mới');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateBlockRequest };
