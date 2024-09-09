import { createNewAccessToken, createRefreshToken } from '../auth/authUtils';
import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import {
  checkPasswordIsNullById,
  findUserById,
  findUserByUserName,
  getUserWithPasswordById,
  updatePasswordById,
} from '../repositories/user.repo';
import bcrypt from 'bcrypt';
import { getInfoData } from '../utils';
import { ERROR_MESSAGE } from '../constants';

class AccessService {
  static login = async (userInfo: Partial<User>) => {
    const foundUser = await findUserByUserName(userInfo.USER_NAME);

    if (!foundUser) {
      throw new BadRequestError(ERROR_MESSAGE.USER_NAME_NOT_EXIST);
    }

    if (!foundUser.IS_ACTIVE) {
      throw new BadRequestError(ERROR_MESSAGE.USER_IS_NOT_ACTIVE);
    }

    const passwordIsNull = await checkPasswordIsNullById(foundUser.ROWGUID);

    if (passwordIsNull) {
      if (userInfo.PASSWORD === process.env.DEFAULT_PASSWORD) {
        return { changeDefaultPassword: true, ROWGUID: foundUser.ROWGUID };
      } else {
        throw new BadRequestError(ERROR_MESSAGE.PASSWORD_IS_INCORRECT);
      }
    }

    const user = await getUserWithPasswordById(foundUser.ROWGUID);

    const isMatch = await bcrypt.compare(userInfo.PASSWORD, user.PASSWORD);

    if (!isMatch) {
      throw new BadRequestError(ERROR_MESSAGE.PASSWORD_IS_INCORRECT);
    }

    const resDataUser = await findUserById(foundUser.ROWGUID);

    const accessToken = createNewAccessToken(resDataUser);
    const refreshToken = createRefreshToken(resDataUser);
    return {
      userInfo: getInfoData(resDataUser, [
        'ROWGUID',
        'USER_NAME',
        'FULLNAME',
        'EMAIL',
        'ADDRESS',
        'BIRTHDAY',
        'ROLE_CODE',
        'ROLE_NAME',
      ]),
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  };

  static changeDefaultPassword = async (userId: string, userInfo: Partial<User>) => {
    const foundUser = await findUserById(userId);
    if (!foundUser) {
      throw new BadRequestError(ERROR_MESSAGE.USER_NAME_NOT_EXIST);
    }

    const passwordIsNull = await checkPasswordIsNullById(userId);
    if (!passwordIsNull) {
      throw new BadRequestError(ERROR_MESSAGE.PASSWORD_IS_ALREADY);
    }

    if (userInfo.PASSWORD === process.env.DEFAULT_PASSWORD) {
      throw new BadRequestError(ERROR_MESSAGE.PASSWORD_IS_DEFAULT);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(userInfo.PASSWORD, salt);

    const updateResult = await updatePasswordById(userId, hashed);
    if (!updateResult) {
      throw new BadRequestError(ERROR_MESSAGE.UPDATE_PASSWORD_FAILED);
    }

    const accessToken = createNewAccessToken(foundUser);
    const refreshToken = createRefreshToken(foundUser);
    return {
      userInfo: getInfoData(foundUser, [
        'ROWGUID',
        'USER_NAME',
        'FULLNAME',
        'EMAIL',
        'ADDRESS',
        'BIRTHDAY',
        'ROLE_CODE',
        'ROLE_NAME',
      ]),
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  };

  static handlerRefreshToken = async (user: User) => {
    const newAccessToken = createNewAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    return {
      userInfo: getInfoData(user, [
        'ROWGUID',
        'USER_NAME',
        'FULLNAME',
        'EMAIL',
        'ADDRESS',
        'BIRTHDAY',
        'ROLE_CODE',
        'ROLE_NAME',
      ]),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  };

  static changePassword = async (user: User, userInfo: any) => {
    const userWithPassword = await getUserWithPasswordById(user.ROWGUID);

    const isMatch = await bcrypt.compare(userInfo.CURRENT_PASSWORD, userWithPassword.PASSWORD);

    if (!isMatch) {
      throw new BadRequestError(ERROR_MESSAGE.PASSWORD_IS_INCORRECT);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(userInfo.PASSWORD, salt);

    const updateResult = await updatePasswordById(user.ROWGUID, hashed);
    if (!updateResult) {
      throw new BadRequestError(ERROR_MESSAGE.UPDATE_PASSWORD_FAILED);
    }

    const newAccessToken = createNewAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    return {
      userInfo: getInfoData(user, [
        'ROWGUID',
        'USER_NAME',
        'FULLNAME',
        'EMAIL',
        'ADDRESS',
        'BIRTHDAY',
        'ROLE_CODE',
        'ROLE_NAME',
      ]),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  };
}
export default AccessService;
