import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { checkDuplicatedID } from '../../utils';
import { BadRequestError } from '../../core/error.response';
import { PackageCellAllocation } from '../../models/package-cell-allocation';

const validatePackageAllocationInsert = (data: PackageCellAllocation) => {
  const blockSchema = Joi.object({
    VOYAGE_CONTAINER_PACKAGE_ID: Joi.string().required().messages({
      'any.required': `Mã kiện hàng không được để trống #thêm mới`,
    }),
    ITEMS_IN_CELL: Joi.number().min(1).messages({
      'number.empty': 'Số lượng hàng tách không được để trống #thêm mới',
      'number.min': 'Số lượng hàng tách phải lớn hơn 0 #thêm mới',
      'number.base': 'Số lượng hàng tách phải là một số #thêm mới',
    }),
    SEQUENCE: Joi.number().min(0).messages({
      'number.empty': 'Số thứ tự không được để trống #thêm mới',
      'number.min': 'Số thứ tự phải là số dương #thêm mới',
      'number.base': 'Số thứ tự phải là một số #thêm mới',
    }),
    SEPARATED_PACKAGE_LENGTH: Joi.number().messages({
      'number.empty': 'Chiều dài package không được để trống #thêm mới',
      'number.min': 'Chiều dài package phải là số dương #thêm mới',
      'number.base': 'Chiều dài package phải là một số #thêm mới',
    }),
    SEPARATED_PACKAGE_WIDTH: Joi.number().messages({
      'number.empty': 'Chiều rộng không được để trống #thêm mới',
      'number.min': 'Chiều rộng phải là số dương #thêm mới',
      'number.base': 'Chiều rộng phải là một số #thêm mới',
    }),
    SEPARATED_PACKAGE_HEIGHT: Joi.number().messages({
      'number.empty': 'Chiều cao không được để trống #thêm mới',
      'number.min': 'Chiều cao phải là số dương #thêm mới',
      'number.base': 'Chiều cao phải là một số #thêm mới',
    }),
    NOTE: Joi.string().optional().allow('').trim(),
    IS_SEPARATED: Joi.boolean().default(false),
  });

  return blockSchema.validate(data);
};

const validatePackageAllocationUpdate = (data: PackageCellAllocation) => {
  const blockSchema = Joi.object({
    ROWGUID: Joi.string().required().messages({
      'any.required': 'ROWGUID không được để trống #cập nhật',
    }),
    VOYAGE_CONTAINER_PACKAGE_ID: Joi.string().required().messages({
      'any.required': `Mã kiện hàng không được để trống`,
    }),
    ITEMS_IN_CELL: Joi.number().min(1).messages({
      'number.empty': 'Số lượng hàng tách không được để trống #cập nhật',
      'number.min': 'Số lượng hàng tách phải lớn hơn 0 #cập nhật',
      'number.base': 'Số lượng hàng tách phải là một số #cập nhật',
    }),
    SEQUENCE: Joi.number().min(0).messages({
      'number.empty': 'Số thứ tự không được để trống #cập nhật',
      'number.min': 'Số thứ tự phải là số dương #cập nhật',
      'number.base': 'Số thứ tự phải là một số #cập nhật',
    }),
    SEPARATED_PACKAGE_LENGTH: Joi.number().messages({
      'number.empty': 'Chiều dài package không được để trống #cập nhật',
      'number.min': 'Chiều dài package phải là số dương #cập nhật',
      'number.base': 'Chiều dài package phải là một số #cập nhật',
    }),
    SEPARATED_PACKAGE_WIDTH: Joi.number().messages({
      'number.empty': 'Chiều rộng không được để trống #cập nhật',
      'number.min': 'Chiều rộng phải là số dương #cập nhật',
      'number.base': 'Chiều rộng phải là một số #cập nhật',
    }),
    SEPARATED_PACKAGE_HEIGHT: Joi.number().messages({
      'number.empty': 'Chiều cao không được để trống #cập nhật',
      'number.min': 'Chiều cao phải là số dương #cập nhật',
      'number.base': 'Chiều cao phải là một số #cập nhật',
    }),
    NOTE: Joi.string().optional().allow('').trim(),
    IS_SEPARATED: Joi.boolean().default(false),
  });

  return blockSchema.validate(data);
};

const validatePackageAllocation = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  const insertData = [];
  const updateData = [];

  if (insert) {
    for (const data of insert) {
      const { error, value } = validatePackageAllocationInsert(data);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }
      insertData.push(value);
    }
  }

  if (update) {
    for (const data of update) {
      const { error, value } = validatePackageAllocationUpdate(data);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }
      updateData.push(value);
    }
  }
  // if (insert) checkDuplicatedID(insert, ['PACKAGE_UNIT_CODE'], 'Thêm mới');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validatePackageAllocation };
