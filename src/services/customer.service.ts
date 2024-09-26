import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { Customer, CustomerInsertUpdate } from '../models/customer.model';
import {
  checkCreateCustomerInfo,
  checkTaxtCode,
  checkUpdateCustomerInfo,
  createCustomer,
  deleteCustomerMany,
  findCustomer,
  getAllCustomer,
  updateCustomer
} from '../repositories/customer.repo';
import { manager } from '../repositories/index.repo';
import { createUser, findUserByUserName, updateUserOfCustomer } from '../repositories/user.repo';
import EmailService from './email.service';
import UserService from './user.service';

class CustomerService {
  static createCustomer = async (customerInfo: CustomerInsertUpdate, createdBy: User) => {
    const checkCustomer = await checkCreateCustomerInfo(
      customerInfo.ID,
      customerInfo.TAX_CODE,
      customerInfo.EMAIL,
    );
    if (checkCustomer) {
      throw new BadRequestError(checkCustomer.message);
    }
    const newUser: any = {
      USERNAME: customerInfo.EMAIL,
      EMAIL: customerInfo.EMAIL,
      FULLNAME: customerInfo.FULLNAME,
      ROLE_ID: 'customer',
      ADDRESS: customerInfo.ADDRESS,
      IS_ACTIVE: true,
      BIRTHDAY: customerInfo.BIRTHDAY || null,
      TELEPHONE: customerInfo.TELEPHONE || null,
      REMARK: customerInfo.REMARK || null,
      CREATED_BY: createdBy.USERNAME,
      UPDATED_BY: createdBy.USERNAME,
    };

    const newCustomer: Customer = {
      ID: customerInfo.ID,
      TAX_CODE: customerInfo.TAX_CODE,
      CUSTOMER_TYPE: customerInfo.CUSTOMER_TYPE,
      USERNAME: customerInfo.EMAIL,
      CREATED_BY: createdBy.USERNAME,
      UPDATED_BY: createdBy.USERNAME,
    };
    let resCreateUser;
    let resCreateCus;
    await manager.transaction(async transactionalEntityManager => {
      try {
        resCreateUser = await createUser(newUser, transactionalEntityManager);
        resCreateCus = await createCustomer(newCustomer, transactionalEntityManager);
        if (!resCreateCus || !resCreateUser) {
          throw new BadRequestError('Lỗi khi tạo khách hàng');
        }
        if (resCreateUser) {
          await EmailService.sendEmailAccountToCustomer(
            {
              account: resCreateUser.USERNAME,
              password: process.env.DEFAULT_PASSWORD,
              webUrl: process.env.WEB_URL,
            },
            resCreateUser.USERNAME,
          );
        }
      } catch (error) {
        console.log(error);
        throw new BadRequestError(`Lỗi khi tạo khách hàng`);
      }
    });
    return { resCreateUser, resCreateCus };
  };
  static updateCustomer = async (customerInfo: CustomerInsertUpdate, createdBy: User) => {
    const checkCustomer = await checkUpdateCustomerInfo(customerInfo.ID, customerInfo.EMAIL);
    if (!checkCustomer) {
      throw new BadRequestError(`Mã khách hàng ${customerInfo.ID} không tồn tại`);
    }
    const checkTaxCode = await checkTaxtCode(customerInfo.ID, customerInfo.TAX_CODE);
    console.log('🚀 ~ CustomerService ~ updateCustomer= ~ checkTaxCode:', checkTaxCode);
    if (checkTaxCode) {
      throw new BadRequestError(
        `Mã số thuế ${customerInfo.TAX_CODE} đã được sử dụng bởi khách hàng ${checkTaxCode.ID}`,
      );
    }
    const updateUserInfo: any = {
      USERNAME: customerInfo.EMAIL,
      FULLNAME: customerInfo.FULLNAME,
      ADDRESS: customerInfo.ADDRESS,
      IS_ACTIVE: customerInfo.IS_ACTIVE,
      BIRTHDAY: customerInfo.BIRTHDAY || null,
      TELEPHONE: customerInfo.TELEPHONE || null,
      REMARK: customerInfo.REMARK || null,
      UPDATED_BY: createdBy.USERNAME,
      UPDATED_AT: new Date(),
    };
    const updateCustomerInfo: Customer = {
      ID: customerInfo.ID,
      TAX_CODE: customerInfo.TAX_CODE,
      CUSTOMER_TYPE: customerInfo.CUSTOMER_TYPE,
      UPDATED_BY: createdBy.USERNAME,
      UPDATED_AT: new Date(),
    };

    await manager.transaction(async transactionalEntityManager => {
      try {
        await updateUserOfCustomer(updateUserInfo, transactionalEntityManager);
        await updateCustomer(updateCustomerInfo, transactionalEntityManager);
      } catch (error) {
        console.log(error);
        throw new BadRequestError(`Lỗi khi cập nhật khách hàng`);
      }
    });
    return true;
  };

  /////////////////////////////////

  // static createAndUpdateCustomer = async (customerInfo: CustomerInsertList, createdBy: User) => {
  //   const insertData = customerInfo.insert;
  //   const updateData = customerInfo.update;

  //   let newCreatedCustomer: Customer[] = [];
  //   let newUpdatedCustomer;
  //   await manager.transaction(async transactionalEntityManager => {
  //     if (insertData) {
  //       for (const customerInfo of insertData) {
  //         const customer = await findCustomerByCode(customerInfo.ID, transactionalEntityManager);
  //         if (customer) {
  //           throw new BadRequestError(`Mã khách hàng ${customer.ID} đã được sử dụng`);
  //         }

  //         const custByTaxCode = await findCustomerTaxCode(
  //           customerInfo.TAX_CODE,
  //           transactionalEntityManager,
  //         );
  //         if (custByTaxCode) {
  //           throw new BadRequestError(
  //             `Mã số thuế ${customerInfo.TAX_CODE} đã được sử dụng bởi khách hàng ${custByTaxCode.ID}`,
  //           );
  //         }

  //         const foundUser = await findUserByUserName(customerInfo.USERNAME);
  //         if (foundUser) {
  //           throw new BadRequestError(
  //             `Email ${customerInfo.USERNAME} đã được sử dụng cho tài khoản khác`,
  //           );
  //         }

  //         customerInfo.CREATED_BY = createdBy.USERNAME;
  //         customerInfo.CREATED_AT = new Date();
  //         customerInfo.UPDATED_BY = createdBy.USERNAME;
  //         customerInfo.UPDATED_AT = new Date();
  //         customerInfo.USERNAME = customerInfo.USERNAME;
  //       }
  //       let insertCustomer: Customer[] = insertData.map(e => ({
  //         ID: e.ID,
  //         TAX_CODE: e.TAX_CODE,
  //         CUSTOMER_TYPE: e.CUSTOMER_TYPE,
  //         USERNAME: e.EMAIL,
  //         CREATED_BY: e.CREATED_BY,
  //         CREATED_AT: e.CREATED_AT,
  //         UPDATED_BY: e.UPDATED_BY,
  //         UPDATED_AT: e.UPDATED_AT,
  //       }));
  //       for (const customer of insertData) {
  //         const userInfo: Partial<User> = {
  //           USERNAME: customer.EMAIL,
  //           EMAIL: customer.EMAIL,
  //           FULLNAME: customer.CUSTOMER_NAME,
  //           ROLE_ID: 'customer',
  //           ADDRESS: customer.ADDRESS,
  //           IS_ACTIVE: customer.IS_ACTIVE,
  //           CREATED_BY: createdBy.USERNAME,
  //           UPDATED_BY: createdBy.USERNAME,
  //         };
  //         try {
  //           const user = userRepository.create(userInfo);
  //           const userAccount = await createUser(user, transactionalEntityManager);
  //           if (userAccount) {
  //             await EmailService.sendEmailAccountToCustomer(
  //               {
  //                 account: userAccount.USERNAME,
  //                 password: process.env.DEFAULT_PASSWORD,
  //                 webUrl: process.env.WEB_URL,
  //               },
  //               customer.USERNAME,
  //             );
  //           }
  //         } catch (error) {
  //           // console.error(`Lối khi tạo tài khoản cho khách hàng ${customer.CUSTOMER_CODE}:`, error);
  //           throw new BadRequestError(
  //             `Lối khi tạo tài khoản cho khách hàng ${customer.ID}:${error.message}`,
  //           );
  //         }
  //       }
  //       newCreatedCustomer = await createCustomer(insertCustomer, transactionalEntityManager);
  //     }

  //     if (updateData) {
  //       for (const customerInfo of updateData) {
  //         const gate = await findCustomerByCode(customerInfo.ID, transactionalEntityManager);
  //         if (!gate) {
  //           throw new BadRequestError(`Mã khách hàng ${customerInfo.ID} không tồn tại`);
  //         }

  //         const custByTaxCode = await findCustomerTaxCode(
  //           customerInfo.TAX_CODE,
  //           transactionalEntityManager,
  //         );
  //         if (custByTaxCode && custByTaxCode.TAX_CODE !== customerInfo.TAX_CODE) {
  //           throw new BadRequestError(
  //             `Mã số thuế ${customerInfo.TAX_CODE} đã được sử dụng bởi khách hàng ${custByTaxCode.TAX_CODE}`,
  //           );
  //         }

  //         customerInfo.UPDATED_BY = createdBy.USERNAME;
  //         customerInfo.UPDATED_AT = new Date();

  //         try {
  //           const existingUser = await findUserByUserName(customerInfo.USERNAME);

  //           if (existingUser) {
  //             const userUpdateInfo: Partial<User> = {
  //               FULLNAME: customerInfo.CUSTOMER_NAME,
  //               IS_ACTIVE: customerInfo.IS_ACTIVE,
  //               ADDRESS: customerInfo.ADDRESS,
  //             };

  //             await UserService.updateUser(existingUser.USERNAME, userUpdateInfo, createdBy);
  //           }
  //         } catch (error) {
  //           throw new BadRequestError(
  //             `Lỗi khi cập nhật tài khoản khách hàng ${customerInfo.CUSTOMER_NAME}: ${error.message}`,
  //           );
  //         }
  //       }
  //       let updateCustome: Customer[] = updateData.map(e => ({
  //         ID: e.ID,
  //         TAX_CODE: e.TAX_CODE,
  //         UPDATED_BY: createdBy.USERNAME,
  //         UPDATED_AT: createdBy.UPDATED_AT,
  //       }));
  //       newUpdatedCustomer = await updateCustomer(updateCustome, transactionalEntityManager);
  //     }
  //   });

  //   return {
  //     newCreatedCustomer,
  //     newUpdatedCustomer,
  //   };
  // };

  static deleteCustomer = async (customerCodeList: string[]) => {
    try {
      // First, fetch all customers to be deleted
      const customersToDelete = await Promise.all(
        customerCodeList.map(async code => {
          const customer = await findCustomer(code.trim());
          if (!customer) {
            throw new BadRequestError(`Mã khách ${code} không tồn tại!`);
          }
          return customer;
        }),
      );

      // Delete customers
      const deleteResult = await deleteCustomerMany(customerCodeList);

      if (deleteResult === true) {
        // If customers were successfully deleted, proceed to delete associated users
        for (const customer of customersToDelete) {
          if (customer.USERNAME) {
            try {
              const user = await findUserByUserName(customer.USERNAME.trim());
              if (user) {
                await UserService.deleteUser(user.USERNAME);
              }
            } catch (error) {
              throw new BadRequestError(
                error.message || `Lỗi khi xoá tài khoản khách hàng ${customer.USERNAME}`,
              );
            }
          }
        }
      }
      return true;
    } catch (error) {
      throw new BadRequestError(`Lỗi khi xoá khách hàng: ${error.message}`);
    }
  };

  static getAllCustomer = async (rule: any) => {
    return await getAllCustomer(rule);
  };

  static getCustomer = async (id: string) => {
    const customer = await findCustomer(id);
    if (!customer) {
      throw new BadRequestError(`Không tìm thấy khách hàng có mã ${id}`);
    }
    const user = await findUserByUserName(customer.USERNAME);

    const customerInfo = {
      ...customer,
      USER_INFO: user,
    };
    return customerInfo;
  };
}
export default CustomerService;
