import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { Vessel } from '../../models/vessel.model';
import { BadRequestError } from '../../core/error.response';
import { checkDuplicatedID } from '../../utils';

const validateInsertVessel = (data: Vessel) => {
  const methodSchema = Joi.object({
    VESSEL_NAME: Joi.string().trim().required().messages({
      'any.required': 'Tên tàu không được để trống #thêm',
      'string.empty': 'Tên tàu không được để trống #thêm',
    }),
    INBOUND_VOYAGE: Joi.string().trim().required().messages({
      'any.required': 'Chuyến nhập không được để trống #thêm',
      'string.empty': 'Chuyến nhập không được để trống #thêm',
    }),
    ETA: Joi.date().required().messages({
      'any.required': 'Ngày tàu đến không được để trống #thêm',
      'date.base': 'Ngày tàu đến phải là một ngày hợp lệ #thêm',
    }),
    CallSign: Joi.string().trim().allow('').optional(),
    IMO: Joi.string().trim().allow('').optional(),
  });

  return methodSchema.validate(data);
};

const validateUpdateVessel = (data: Vessel) => {
  const methodSchema = Joi.object({
    VOYAGEKEY: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Mã tàu không được để trống #cập nhật',
    }),
    VESSEL_NAME: Joi.string().trim().optional(),
    INBOUND_VOYAGE: Joi.string().trim().optional(),
    ETA: Joi.date().optional().messages({
      'date.base': 'Ngày tàu đến phải là một ngày hợp lệ #cập nhật',
    }),
    CallSign: Joi.string().trim().allow('').optional(),
    IMO: Joi.string().trim().allow('').optional(),
  });

  return methodSchema.validate(data);
};

const validateVesselRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert?.length === 0 && update?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  const updateData = [];
  if (insert) {
    for (const vesselInfo of insert) {
      const { error, value } = validateInsertVessel(vesselInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  if (update) {
    for (const vesselInfo of update) {
      const { error, value } = validateUpdateVessel(vesselInfo);

      if (error) {
        throw new BadRequestError(error.message);
      }

      updateData.push(value);
    }
  }

  if (insert) checkDuplicatedID(insert, ['INBOUND_VOYAGE'], 'thêm mới');
  if (update) checkDuplicatedID(update, ['INBOUND_VOYAGE'], 'cập nhật');

  res.locals.requestData = { insert: insertData, update: updateData };
  next();
};

export { validateVesselRequest };
