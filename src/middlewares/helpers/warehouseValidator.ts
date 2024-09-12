import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { WareHouse } from '../../models/warehouse.model';
import { BadRequestError } from '../../core/error.response';

const validateWarehouse = (data: WareHouse) => {
  const blockSchema = Joi.object({
    ID: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã kho không được để trống',
      'string.empty': 'Mã kho không được để trống',
    }),
    NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên kho không được để trống',
      'string.empty': 'Tên kho không được để trống',
    }),
  });

  return blockSchema.validate(data);
};

const validateWarehouseRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  const insertData = [];
  const updateData = [];

  if (insert) {
    for (const data of insert) {
      const { error, value } = validateWarehouse(data);

      if (error) {
        throw new BadRequestError(error.message);
      }
      insertData.push(value);
    }
  }

  if (update) {
    for (const data of update) {
      const { error, value } = validateWarehouse(data);

      if (error) {
        throw new BadRequestError(error.message);
      }
      updateData.push(value);
    }
  }
  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateWarehouseRequest };
