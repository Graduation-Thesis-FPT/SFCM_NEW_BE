import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { Customer, CustomerInsertList } from '../models/customer.model';
import {
  createCustomer,
  deleteCustomerMany,
  findCustomer,
  findCustomerByCode,
  findCustomerTaxCode,
  getAllCustomer,
  updateCustomer,
} from '../repositories/customer.repo';
import { manager } from '../repositories/index.repo';
import { createUser, findUserByUserName, userRepository } from '../repositories/user.repo';
import EmailService from './email.service';
import UserService from './user.service';

class CustomerService {
  static createAndUpdateCustomer = async (customerInfo: CustomerInsertList, createBy: User) => {
    const insertData = customerInfo.insert;
    const updateData = customerInfo.update;

    let newCreatedCustomer: Customer[] = [];
    let newUpdatedCustomer;
    await manager.transaction(async transactionalEntityManager => {
      if (insertData) {
        for (const customerInfo of insertData) {
          const customer = await findCustomerByCode(customerInfo.ID, transactionalEntityManager);
          if (customer) {
            throw new BadRequestError(`Mã khách hàng ${customer.ID} đã tồn tại`);
          }

          const custByTaxCode = await findCustomerTaxCode(
            customerInfo.TAX_CODE,
            transactionalEntityManager,
          );
          if (custByTaxCode) {
            throw new BadRequestError(
              `Mã số thuế ${customerInfo.TAX_CODE} đã được sử dụng bởi khách hàng ${custByTaxCode.ID}`,
            );
          }

          const foundUser = await findUserByUserName(customerInfo.USERNAME);
          if (foundUser) {
            throw new BadRequestError(
              `Email ${customerInfo.USERNAME} đã được sử dụng cho tài khoản khác`,
            );
          }

          customerInfo.CREATE_BY = createBy.USERNAME;
          customerInfo.CREATE_DATE = new Date();
          customerInfo.UPDATE_BY = createBy.USERNAME;
          customerInfo.UPDATE_DATE = new Date();
          customerInfo.USERNAME = customerInfo.USERNAME;
        }
        let insertCustomer: Customer[] = insertData.map(e => ({
          ID: e.ID,
          TAX_CODE: e.TAX_CODE,
          USERNAME: e.EMAIL,
          CREATE_BY: e.CREATE_BY,
          CREATE_DATE: e.CREATE_DATE,
          UPDATE_BY: e.UPDATE_BY,
          UPDATE_DATE: e.UPDATE_DATE,
        }));
        for (const customer of insertData) {
          const userInfo: Partial<User> = {
            USERNAME: customer.EMAIL,
            EMAIL: customer.EMAIL,
            FULLNAME: customer.CUSTOMER_NAME,
            ROLE_CODE: 'customer',
            ADDRESS: customer.ADDRESS,
            IS_ACTIVE: customer.IS_ACTIVE,
            CREATE_BY: createBy.USERNAME,
            UPDATE_BY: createBy.USERNAME,
          };
          try {
            const user = userRepository.create(userInfo);
            const userAccount = await createUser(user, transactionalEntityManager);
            if (userAccount) {
              await EmailService.sendEmailAccountToCustomer(
                {
                  account: userAccount.USERNAME,
                  password: process.env.DEFAULT_PASSWORD,
                  webUrl: process.env.WEB_URL,
                },
                customer.USERNAME,
              );
            }
          } catch (error) {
            // console.error(`Lối khi tạo tài khoản cho khách hàng ${customer.CUSTOMER_CODE}:`, error);
            throw new BadRequestError(
              `Lối khi tạo tài khoản cho khách hàng ${customer.ID}:${error.message}`,
            );
          }
        }
        newCreatedCustomer = await createCustomer(insertCustomer, transactionalEntityManager);
      }

      if (updateData) {
        for (const customerInfo of updateData) {
          const gate = await findCustomerByCode(customerInfo.ID, transactionalEntityManager);
          if (!gate) {
            throw new BadRequestError(`Mã khách hàng ${customerInfo.ID} không tồn tại`);
          }

          const custByTaxCode = await findCustomerTaxCode(
            customerInfo.TAX_CODE,
            transactionalEntityManager,
          );
          if (custByTaxCode && custByTaxCode.TAX_CODE !== customerInfo.TAX_CODE) {
            throw new BadRequestError(
              `Mã số thuế ${customerInfo.TAX_CODE} đã được sử dụng bởi khách hàng ${custByTaxCode.TAX_CODE}`,
            );
          }

          customerInfo.UPDATE_BY = createBy.USERNAME;
          customerInfo.UPDATE_DATE = new Date();

          try {
            const existingUser = await findUserByUserName(customerInfo.USERNAME);

            if (existingUser) {
              const userUpdateInfo: Partial<User> = {
                FULLNAME: customerInfo.CUSTOMER_NAME,
                IS_ACTIVE: customerInfo.IS_ACTIVE,
                ADDRESS: customerInfo.ADDRESS,
              };

              await UserService.updateUser(existingUser.USERNAME, userUpdateInfo, createBy);
            }
          } catch (error) {
            throw new BadRequestError(
              `Lỗi khi cập nhật tài khoản khách hàng ${customerInfo.CUSTOMER_NAME}: ${error.message}`,
            );
          }
        }
        let updateCustome: Customer[] = updateData.map(e => ({
          ID: e.ID,
          TAX_CODE: e.TAX_CODE,
          UPDATE_BY: createBy.USERNAME,
          UPDATE_DATE: createBy.UPDATE_DATE,
        }));
        newUpdatedCustomer = await updateCustomer(updateCustome, transactionalEntityManager);
      }
    });

    return {
      newCreatedCustomer,
      newUpdatedCustomer,
    };
  };

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

  static getAllCustomer = async () => {
    return await getAllCustomer();
  };
}
export default CustomerService;
