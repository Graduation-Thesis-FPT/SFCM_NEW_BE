import { EntityManager } from 'typeorm';
import { ERROR_MESSAGE } from '../constants';
import { BadRequestError } from '../core/error.response';
// import { Customer } from '../entity/customer.entity';
import { User } from '../entity/user.entity';
// import {
//   findCustomerByUserName,
//   updateCustomer,
//   updateOneCustomer,
// } from '../repositories/customer.repo';
import { manager } from '../repositories/index.repo';
import {
  activeUser,
  createUser,
  deactiveUser,
  deleteUser,
  findUserById,
  findUserByUserName,
  getAllUser,
  resetPasswordById,
  updateUser,
  userRepository,
} from '../repositories/user.repo';
import { isValidInfor, removeUndefinedProperty } from '../utils';

class UserService {
  static createUserAccount = async (userInfo: User, createBy: User): Promise<User> => {
    let newUser: User;
    await manager.transaction(async transactionalEntityManager => {
      const foundUser = await findUserByUserName(userInfo.USERNAME);

      if (foundUser) {
        throw new BadRequestError(ERROR_MESSAGE.USER_ALREADY_EXIST);
      }

      if (userInfo.BIRTHDAY) userInfo.BIRTHDAY = new Date(userInfo.BIRTHDAY);
      userInfo.CREATED_BY = createBy.USERNAME;
      userInfo.UPDATED_BY = createBy.USERNAME;
      const user = userRepository.create(userInfo);

      await isValidInfor(user);

      newUser = await createUser(user, transactionalEntityManager);
    });

    return newUser;
  };

  static findUserById = async (userId: string): Promise<User> => {
    return await findUserById(userId);
  };

  /**
   * Permanently delete a user
   * @param userId
   * @returns
   */
  static deleteUser = async (userId: string) => {
    // const user = await findUserById(userId);

    // if (!user) {
    //   throw new BadRequestError('Error: User not exist!');
    // }

    return await deleteUser(userId);
  };

  /**
   * Deactive User
   * @param userId
   * @returns
   */
  static deactiveUser = async (userId: string) => {
    const user = await findUserById(userId);

    if (!user) {
      throw new BadRequestError(ERROR_MESSAGE.USER_NOT_EXIST);
    }

    return await deactiveUser(userId);
  };

  /**
   * Active User
   * @param userId
   * @returns
   */
  static activeUser = async (userId: string) => {
    const user = await findUserById(userId);

    if (!user) {
      throw new BadRequestError(ERROR_MESSAGE.USER_NOT_EXIST);
    }

    return await activeUser(userId);
  };

  static getAllUser = async (): Promise<User[]> => {
    return await getAllUser();
  };

  /**
   * Update User
   * @param userId
   * @param userInfo
   * @returns
   */
  static updateUser = async (userId: string, userInfo: Partial<User>, updateBy: User) => {
    await manager.transaction(async transactionalEntityManager => {
      const user = await findUserById(userId);

      if (!user) {
        throw new BadRequestError(ERROR_MESSAGE.USER_NOT_EXIST);
      }

      if (userInfo.USERNAME && userInfo.USERNAME !== user.USERNAME) {
        const isDuplicatedUserName = await findUserByUserName(userInfo.USERNAME);

        if (isDuplicatedUserName && isDuplicatedUserName.USERNAME !== userId) {
          throw new BadRequestError(
            `${ERROR_MESSAGE.USER_NAME_IS_DUPLICATED} : ${userInfo.USERNAME}`,
          );
        }
      }

      const objectParams = removeUndefinedProperty({
        ...userInfo,
        BIRTHDAY: userInfo.BIRTHDAY || null,
        UPDATED_BY: updateBy.USERNAME,
      });

      if (
        user.ROLE_ID === 'customer' &&
        objectParams.ROLE_ID &&
        objectParams.ROLE_ID !== 'customer'
      ) {
        throw new BadRequestError('Khách hàng không thể thay đổi chức vụ!');
      }
      if (user.ROLE_ID !== 'customer' && objectParams.ROLE_ID === 'customer') {
        throw new BadRequestError('Chức vụ không thể thay đổi thành khách hàng!');
      }

      const updatedUser = await updateUser(userId, objectParams);
      // if (user.ROLE_ID === 'customer') {
      //   const customerUpdateInfo: Partial<Customer> = removeUndefinedProperty({
      //     CUSTOMER_NAME: objectParams.FULLNAME,
      //     IS_ACTIVE: objectParams.IS_ACTIVE,
      //     ADDRESS: objectParams.ADDRESS,
      //     UPDATED_BY: updateBy.USERNAME,
      //     UPDATED_AT: new Date(),
      //   });

      //   if (Object.keys(customerUpdateInfo).length > 0) {
      //     try {
      //       // await updateOneCustomer(user.USERNAME, customerUpdateInfo, transactionalEntityManager);
      //     } catch (error) {
      //       throw new BadRequestError(`Lỗi khi cập nhật thông tin khách hàng: ${error.message}`);
      //     }
      //   }
      // }

      return updatedUser;
    });
  };

  static resetPasswordById = async (userId: string, defaultPassword: string) => {
    if (defaultPassword !== process.env.DEFAULT_PASSWORD) {
      throw new BadRequestError(ERROR_MESSAGE.PASSWORD_IS_DEFAULT);
    }
    return await resetPasswordById(userId);
  };
}

export default UserService;
