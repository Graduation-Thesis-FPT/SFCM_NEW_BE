import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { VoyageContainerPackage } from '../../models/voyage-container-package';
import { BadRequestError } from '../../core/error.response';
import { checkDuplicatedID } from '../../utils';

const validateCreateData = (data: VoyageContainerPackage) => {
  const methodSchema = Joi.object({
    HOUSE_BILL: Joi.string().trim().required().messages({
      'string.empty': 'Số House Bill không được để trống',
    }),
    VOYAGE_CONTAINER_ID: Joi.string().trim().required().messages({
      'string.empty': 'Số container không được để trống',
    }),
    NOTE: Joi.string().trim().allow('').optional(),
    PACKAGE_TYPE_ID: Joi.string().trim().required().messages({
      'string.empty': 'Loại hàng hóa không được để trống',
    }),
    PACKAGE_UNIT: Joi.string().trim().required().messages({
      'string.empty': 'Đơn vị tính hàng hóa không được để trống',
    }),
    TOTAL_ITEMS: Joi.number().positive().greater(0).messages({
      'number.positive': 'Số lượng hàng hóa phải là số dương',
      'number.base': 'Số lượng hàng hóa không được để trống',
    }),
    CBM: Joi.number().positive().required().messages({
      'number.base': 'Số khối không được để trống',
      'number.positive': 'Số khối phải là số dương',
      'string.empty': 'Số khối không được để trống',
    }),
    TIME_IN: Joi.date().optional().allow('').messages({
      'date.base': 'Thời gian vào không hợp lệ',
      'string.empty': 'Thời gian vào không được để trống',
    }),
    CONSIGNEE_ID: Joi.string().trim().required().messages({
      'string.empty': 'Chủ hàng không được để trống',
    }),
    STATUS: Joi.string().trim().default('IN_CONTAINER').messages({
      'string.empty': 'Trạng thái không được để trống',
    }),
  });

  return methodSchema.validate(data);
};

const validateUpdateData = (data: VoyageContainerPackage) => {
  const methodSchema = Joi.object({
    ID: Joi.string().trim().required().messages({
      'string.empty': 'ID không được để trống',
    }),
    HOUSE_BILL: Joi.string().trim().uppercase().messages({
      'string.empty': 'Số House Bill không được để trống',
    }),
    VOYAGE_CONTAINER_ID: Joi.string().trim().messages({
      'string.empty': 'Số container không được để trống',
    }),
    NOTE: Joi.string().trim().allow('').optional(),
    PACKAGE_TYPE_ID: Joi.string().trim().messages({
      'string.empty': 'Loại hàng hóa không được để trống',
    }),
    PACKAGE_UNIT: Joi.string().trim().messages({
      'string.empty': 'Đơn vị tính hàng hóa không được để trống',
    }),
    TOTAL_ITEMS: Joi.number().positive().greater(0).messages({
      'number.positive': 'Số lượng hàng hóa phải là số dương',
      'number.base': 'Số lượng hàng hóa không được để trống',
    }),
    CBM: Joi.number().positive().messages({
      'number.base': 'Số khối không được để trống!',
      'number.positive': 'Số khối phải là số dương',
      'string.empty': 'Số khối không được để trống',
    }),
    TIME_IN: Joi.date().optional().allow('').messages({
      'date.base': 'Thời gian vào không hợp lệ',
      'string.empty': 'Thời gian vào không được để trống',
    }),
    CONSIGNEE_ID: Joi.string().trim().messages({
      'string.empty': 'Chủ hàng không được để trống',
    }),
    STATUS: Joi.string().trim().messages({
      'string.empty': 'Trạng thái không được để trống',
    }),
  });

  return methodSchema.validate(data);
};

const validateVoyageContainerPackageRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const data of insert) {
      const { error, value } = validateCreateData(data);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const data of update) {
      const { error, value } = validateUpdateData(data);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }
  if (insert) checkDuplicatedID(insert, ['HOUSE_BILL'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['HOUSE_BILL'], 'cập nhật');
  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateVoyageContainerPackageRequest };
