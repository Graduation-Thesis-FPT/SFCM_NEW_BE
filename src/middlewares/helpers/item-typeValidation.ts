import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { checkDuplicatedID } from '../../utils';
import { BadRequestError } from '../../core/error.response';
import { ItemType } from '../../models/package-type.model';

const validateItemType = (data: ItemType) => {
  const blockSchema = Joi.object({
    ITEM_TYPE_CODE: Joi.string().uppercase().trim().required().messages({
      'any.required': `Mã loại hàng hóa không được để trống`,
      'string.empty': `Mã loại hàng hóa không được để trống`,
    }),
    ITEM_TYPE_NAME: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Tên Loại hàng hóa không được để trống',
      'string.empty': 'Tên Loại hàng hóa không được để trống',
    }),
  });

  return blockSchema.validate(data);
};

const validateItemTypeRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];

  if (insert) {
    for (const data of insert) {
      const { error, value } = validateItemType(data);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }
      insertData.push(value);
    }
  }

  if (update) {
    for (const data of update) {
      const { error, value } = validateItemType(data);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }
      updateData.push(value);
    }
  }
  if (insert) checkDuplicatedID(insert, ['ITEM_TYPE_CODE', 'ITEM_TYPE_NAME'], 'Thêm mới');
  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateItemTypeRequest };
