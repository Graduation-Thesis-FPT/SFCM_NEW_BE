import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/user.entity';
import { BadRequestError, UnAuthorizedError } from '../core/error.response';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from '../utils';
import { findUserById } from '../repositories/user.repo';
import { ERROR_MESSAGE } from '../constants';

const HEADER = {
  AUTHORIZATION: 'token',
  REFRESHTOKEN: 'rtoken',
};

const createNewAccessToken = (userInfo: Partial<User>) => {
  return jwt.sign(userInfo, process.env.ACCESS_TOKEN_SIGN_SECRET, {
    expiresIn: process.env.EXPIRES_ACCESS_TOKEN,
  });
};

const createRefreshToken = (userInfo: Partial<User>) => {
  return jwt.sign(userInfo, process.env.REFRESH_TOKEN_SIGN_SECRET, {
    expiresIn: process.env.EXPIRES_REFRESH_TOKEN,
  });
};

const authentication = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers[HEADER.AUTHORIZATION] as string;
  if (!accessToken) {
    throw new BadRequestError(ERROR_MESSAGE.INVALID_REQUEST_MISSING_TOKEN);
  }

  try {
    const decodeUser: JwtPayload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SIGN_SECRET,
    ) as JwtPayload;
    const user = await findUserById(decodeUser.USERNAME);
    if (!user) {
      throw new UnAuthorizedError(ERROR_MESSAGE.INVALID_REQUEST);
    }

    if (!user.IS_ACTIVE) {
      throw new BadRequestError('Tài khoản đã bị khóa');
    }
    res.locals.user = user;
    next();
  } catch (error) {
    throw error;
  }
});

const verifyRefreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const resfreshToken = req.headers[HEADER.REFRESHTOKEN] as string;

  if (!resfreshToken) {
    throw new BadRequestError(ERROR_MESSAGE.INVALID_REQUEST_MISSING_TOKEN);
  }

  try {
    const decodeUser: JwtPayload = jwt.verify(
      resfreshToken,
      process.env.REFRESH_TOKEN_SIGN_SECRET,
    ) as JwtPayload;
    const user = await findUserById(decodeUser.ROWGUID);
    if (!user) {
      throw new UnAuthorizedError(ERROR_MESSAGE.INVALID_REQUEST);
    }

    res.locals.user = user;
    next();
  } catch (error) {
    throw error;
  }
});

export { createNewAccessToken, createRefreshToken, authentication, verifyRefreshToken };
