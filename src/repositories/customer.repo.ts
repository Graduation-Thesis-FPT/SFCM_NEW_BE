import { DeleteResult, EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { Customer as CustomerEntity } from '../entity/customer.entity';
import { Customer } from '../models/customer.model';

export const customerRepository = mssqlConnection.getRepository(CustomerEntity);

export const checkCreateCustomerInfo = async (ID: string, TAX_CODE: string, EMAIL: string) => {
  return await customerRepository
    .createQueryBuilder('customer')
    .leftJoinAndSelect('USER', 'user', 'user.USERNAME = customer.USERNAME')
    .select(
      "CASE WHEN customer.ID = :id THEN CONCAT(N'Mã khách hàng ', customer.ID, N' đã được sử dụng')" +
        "WHEN customer.TAX_CODE = :taxCode THEN CONCAT(N'Mã số thuế ', customer.TAX_CODE, N' đã được sử dụng')" +
        "WHEN user.USERNAME = :email THEN CONCAT('Email ', user.USERNAME, N' đã được sử dụng') END",
      'message',
    )
    .where('customer.ID = :id OR customer.TAX_CODE = :taxCode OR user.USERNAME = :email', {
      id: ID,
      taxCode: TAX_CODE,
      email: EMAIL,
    })
    .getRawOne();
};

export const checkUpdateCustomerInfo = async (ID: string, EMAIL: string) => {
  return await customerRepository
    .createQueryBuilder('customer')
    .leftJoinAndSelect('USER', 'user', 'user.USERNAME = customer.USERNAME')
    .where('customer.ID = :ID', { ID: ID })
    .andWhere('user.USERNAME = :userName', { userName: EMAIL })
    .getRawOne();
};

export const checkTaxtCode = async (ID: string, TAX_CODE: string) => {
  return await customerRepository
    .createQueryBuilder('customer')
    .where('customer.TAX_CODE = :taxCode AND customer.ID != :ID', {
      taxCode: TAX_CODE,
      ID: ID,
    })
    .getOne();
};

export const checkCustomerUpdateType = async (ID: string, CUSTOMER_TYPE: string) => {
  const customerContainer = await customerRepository
    .createQueryBuilder('cus')
    .leftJoin('VOYAGE_CONTAINER', 'cn', 'cus.ID = cn.SHIPPER_ID')
    .where('cus.ID = :customerID', { customerID: ID })
    .andWhere('cn.ID is not null')
    .select(['cus.CUSTOMER_TYPE as CUSTOMER_TYPE'])
    .groupBy('cus.CUSTOMER_TYPE')
    .getRawMany();
  if (customerContainer.length && customerContainer[0].CUSTOMER_TYPE != CUSTOMER_TYPE) {
    return false;
  }
  const customerPackage = await customerRepository
    .createQueryBuilder('cus')
    .leftJoin('VOYAGE_CONTAINER_PACKAGE', 'pk', 'cus.ID = pk.CONSIGNEE_ID')
    .where('cus.ID = :customerID', { customerID: ID })
    .andWhere('pk.ID is not null')
    .select(['cus.CUSTOMER_TYPE as CUSTOMER_TYPE'])
    .groupBy('cus.CUSTOMER_TYPE')
    .getRawMany();
  if (customerPackage.length && customerPackage[0].CUSTOMER_TYPE != CUSTOMER_TYPE) {
    return false;
  } else {
    return true;
  }
};

export const getAllCustomer = async (rule: any) => {
  const filterObj = rule;
  return await customerRepository
    .createQueryBuilder('customer')
    .leftJoinAndSelect('USER', 'user', 'user.USERNAME = customer.USERNAME')
    .select([
      'customer.ID as ID',
      'customer.TAX_CODE as TAX_CODE',
      'customer.CUSTOMER_TYPE as CUSTOMER_TYPE',
      'user.FULLNAME as FULLNAME',
      'customer.USERNAME as EMAIL',
      'user.IS_ACTIVE as IS_ACTIVE',
      'user.ADDRESS as ADDRESS',
      'user.BIRTHDAY as BIRTHDAY',
      'user.TELEPHONE as TELEPHONE',
      'user.REMARK as REMARK',
    ])
    .orderBy('customer.UPDATED_AT', 'DESC')
    .where(filterObj)
    .getRawMany();
};

export const createCustomer = async (
  newCus: Customer,
  transactionalEntityManager: EntityManager,
) => {
  const customer = customerRepository.create(newCus);
  const newCustomer = await transactionalEntityManager.save(customer);
  return newCustomer;
};

export const updateCustomer = async (
  customerInfo: Customer,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager.update(CustomerEntity, customerInfo.ID, customerInfo);
};

////////////////////////////////////////

// const createCustomer = async (
//   customerListInfo: Customer[],
//   transactionalEntityManager: EntityManager,
// ) => {
//   const customer = customerRepository.create(customerListInfo);

//   const newCustomer = await transactionalEntityManager.save(customer);
//   return newCustomer;
// };

// const updateOneCustomer = async (
//   userName: string,
//   customerInfo: Partial<Customer>,
//   transactionalEntityManager: EntityManager,
// ) => {
//   return await transactionalEntityManager.update(
//     CustomerEntity,
//     { USERNAME: userName },
//     customerInfo,
//   );
// };

const findCustomerByCode = async (
  customerCode: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(CustomerEntity, 'cust')
    .where('cust.ID = :customerCode', { customerCode: customerCode })
    .getOne();
};

const findCustomerTaxCode = async (TAX_CODE: string, transactionalEntityManager: EntityManager) => {
  return await transactionalEntityManager
    .createQueryBuilder(CustomerEntity, 'cust')
    .where('cust.TAX_CODE = :TAX_CODE', { TAX_CODE: TAX_CODE })
    .getOne();
};

const findCustomer = async (customerCode: string) => {
  return await customerRepository
    .createQueryBuilder('customer')
    .where('customer.ID = :customerCode', {
      customerCode: customerCode,
    })
    .getOne();
};

const deleteCustomerMany = async (customerCode: string[]): Promise<true | DeleteResult> => {
  const result = await customerRepository.delete(customerCode);
  if (result.affected === customerCode.length) {
    return true;
  } else {
    return result;
  }
};

const findCustomerByUserName = async (userName: string) => {
  return await customerRepository
    .createQueryBuilder('customer')
    .where('customer.USERNAME = :userName', {
      userName: userName,
    })
    .getOne();
};

const getCustomers = async (customerCodes: string[]): Promise<Customer[]> => {
  return await customerRepository
    .createQueryBuilder('customer')
    .where('customer.ID IN (:...codes)', {
      codes: customerCodes.map(code => code.trim()),
    })
    .getMany();
};
const getCustomersWithUserNames = async (customerCodes: string[]): Promise<CustomerEntity[]> => {
  return await customerRepository
    .createQueryBuilder('customer')
    .select(['customer.ID', 'customer.USERNAME']) // Adjust field names if necessary
    .where('customer.ID IN (:...codes)', { codes: customerCodes })
    .getMany();
};

export {
  findCustomerByCode,
  deleteCustomerMany,
  findCustomer,
  findCustomerByUserName,
  getCustomers,
  getCustomersWithUserNames,
  findCustomerTaxCode,
};
