import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { checkDuplicatedID } from '../../utils';
import { BadRequestError } from '../../core/error.response';
import { PackageUnit } from '../../entity/packge-unit.entity';

const validatePackageUnit = (data: PackageUnit) => {
  const blockSchema = Joi.object({
    PACKAGE_UNIT_CODE: Joi.string().uppercase().trim().required().messages({
      'any.required': `Mã đơn vị tính không được để trống`,
    }),
    PACKAGE_UNIT_NAME: Joi.string().uppercase().trim().required().messages({
      'any.required': 'Tên đơn vị tính không được để trống',
    }),
  });

  return blockSchema.validate(data);
};

const validatePackageUnitRequest = (req: Request, res: Response, next: NextFunction) => {
  const { insert, update } = req.body;

  if (insert) {
    for (const data of insert) {
      const { error, value } = validatePackageUnit(data);

      if (error) {
        console.log(error.details);
        throw new BadRequestError(error.message);
      }
    }
  }

  if (update) {
    for (const data of update) {
      const { error, value } = validatePackageUnit(data);

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

export { validatePackageUnitRequest };
