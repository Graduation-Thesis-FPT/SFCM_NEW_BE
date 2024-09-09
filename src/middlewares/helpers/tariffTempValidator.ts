import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../../core/error.response';
import { TariffTemp } from '../../models/tariff-temp.model';

const validateInsertTariffTemp = (data: TariffTemp) => {
  const tariffTemSchema = Joi.object({
    TRF_TEMP_NAME: Joi.string().required().trim().messages({
      'any.required': 'Tên mẫu biểu cước không được để trống',
      'string.empty': 'Tên mẫu biểu cước không được để trống',
    }),
    FROM_DATE: Joi.date().required().messages({
      'any.required': 'Ngày hiệu lực biểu cước không được để trống',
      'date.base': 'Ngày hiệu lực biểu cước phải là một ngày hợp lệ',
    }),
    TO_DATE: Joi.date().required().messages({
      'any.required': 'Ngày hết hạn biểu cước không được để trống',
      'date.base': 'Ngày hết hạn biểu cước phải là một ngày hợp lệ',
    }),
  });

  return tariffTemSchema.validate(data);
};

const validateTariffTempRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert } = req.body;

  if (insert?.length === 0) {
    throw new BadRequestError();
  }

  const insertData = [];
  if (insert) {
    for (const tariff of insert) {
      const { error, value } = validateInsertTariffTemp(tariff);

      if (error) {
        throw new BadRequestError(error.message);
      }

      insertData.push(value);
    }
  }

  res.locals.requestData = { insert: insertData };
  next();
};

export { validateTariffTempRequest };
