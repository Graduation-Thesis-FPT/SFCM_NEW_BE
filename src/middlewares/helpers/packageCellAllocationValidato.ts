import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { checkDuplicatedID } from '../../utils';
import { BadRequestError } from '../../core/error.response';
import { PackageCellAllocation } from '../../models/package-cell-allocation';

const validatePackageAllocationInsert = (data: PackageCellAllocation) => {
  const blockSchema = Joi.object({
    VOYAGE_CONTAINER_PACKAGE_ID: Joi.string().uppercase().trim().required().messages({
      'any.required': `Mã kiện hàng không được để trống`,
    }),
    CELL_ID: Joi.string().trim().messages({
      'any.required': 'Tên đơn vị tính không được để trống',
    }),
    ITEMS_IN_CELL: Joi.number().min(0).messages({
      'number.empty': 'Tổng tiền không được để trống #cập nhật',
      'number.min': 'Tổng tiền phải là số dương #cập nhật',
      'number.base': 'Tổng tiền phải là một số #cập nhật',
    }),
    SEQUENCE: Joi.number().min(0).messages({
      'number.empty': 'Số thứ tự không được để trống #cập nhật',
      'number.min': 'Số thứ tự phải là số dương #cập nhật',
      'number.base': 'Số thứ tự phải là một số #cập nhật',
    }),
    NOTE: Joi.string().trim(),
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
    IS_SEPARATED: Joi.boolean().default(false),
  });

  return blockSchema.validate(data);
};

const validatePackageAllocationUpdate = (data: PackageCellAllocation) => {
  const blockSchema = Joi.object({
    ROWGUID: Joi.string().trim().required().messages({
      'any.required': 'ROWGUID không được để trống #cập nhật',
    }),
    VOYAGE_CONTAINER_PACKAGE_ID: Joi.string().uppercase().trim().required().messages({
      'any.required': `Mã kiện hàng không được để trống`,
    }),
    CELL_ID: Joi.string().trim().messages({
      'any.required': 'Tên đơn vị tính không được để trống',
    }),
    ITEMS_IN_CELL: Joi.number().min(0).messages({
      'number.empty': 'Tổng tiền không được để trống #cập nhật',
      'number.min': 'Tổng tiền phải là số dương #cập nhật',
      'number.base': 'Tổng tiền phải là một số #cập nhật',
    }),
    SEQUENCE: Joi.number().min(0).messages({
      'number.empty': 'Số thứ tự không được để trống #cập nhật',
      'number.min': 'Số thứ tự phải là số dương #cập nhật',
      'number.base': 'Số thứ tự phải là một số #cập nhật',
    }),
    NOTE: Joi.string().trim(),
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
    IS_SEPARATED: Joi.boolean().default(false),
  });

  return blockSchema.validate(data);
};

const validatePackageAllocation = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert) {
    for (const data of insert) {
      const { error, value } = validatePackageAllocationInsert(data);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }
    }
  }

  if (update) {
    for (const data of update) {
      const { error, value } = validatePackageAllocationUpdate(data);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }
    }
  }
  if (insert) checkDuplicatedID(insert, ['PACKAGE_UNIT_CODE'], 'Thêm mới');

  res.locals.requestData = req.body;
  next();
};

export { validatePackageAllocation };
