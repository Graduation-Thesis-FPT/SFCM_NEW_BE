import { NextFunction, Request, Response } from 'express';
import { validate } from 'class-validator';
import _ from 'lodash';
import { BadRequestError } from '../core/error.response';
import { dbColumns } from '../constants';

const isValidInfor = async (requestData: object) => {
  const errors = await validate(requestData);
  if (errors.length > 0) {
    const errorMessages = errors.map(error => Object.values(error.constraints)).join(', ');
    throw new BadRequestError(`${errorMessages}`);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeUndefinedProperty = (obj: Record<string, any>) => {
  Object.keys(obj).forEach((key: string) => {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key];
    }

    if (typeof obj[key] === 'object') {
      removeUndefinedProperty(obj[key]);
    }
  });

  return obj;
};

const getInfoData = (object: object, fields: string[]) => {
  return _.pick(object, fields);
};

const isValidID = (id: string) => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  if (!uuidRegex.test(id)) return false;
  return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkDuplicatedID = (data: any, key: string[], tag: string) => {
  key.forEach(key => {
    const uniqueData = _.uniqBy(data, key);
    if (uniqueData.length !== data.length) {
      throw new BadRequestError(`Trùng ${dbColumns[key]} trong khi ${tag}`);
    }
  });
};

const generateKeyVessel = (vesselName: string, inboundVoyage: string, etaDate: Date) => {
  const vesselCode =
    vesselName.slice(0, 4) + inboundVoyage + etaDate.toISOString().slice(0, 10).split('-').join('');
  return vesselCode.toUpperCase();
};

const checkContSize = (sizeType: string) => {
  switch (sizeType.charAt(0)) {
    case '2':
      return '20';
    case '4':
      return '40';
    case 'L':
    case 'M':
    case '9':
      return '45';
    default:
      return '';
  }
};

const roundMoney = (money: number) => {
  return (Math.round(money * 10) / 10).toFixed(0);
};

export {
  removeUndefinedProperty,
  asyncHandler,
  isValidInfor,
  getInfoData,
  isValidID,
  checkDuplicatedID,
  generateKeyVessel,
  checkContSize,
  roundMoney,
};
