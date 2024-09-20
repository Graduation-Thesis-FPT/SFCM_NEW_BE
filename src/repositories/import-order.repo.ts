import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { ImportOrder, ImportOrderDetail } from '../models/import-order.model';
import { ImportOrder as ImportOrderEntity } from '../entity/import-order.entity';
import { ImportOrderDetail as ImportOrderDetailEntity } from '../entity/import-order-dtl.entity';
import { Customer as CustomerEntity } from '../entity/customer.entity';
import { VoyageEntity } from '../entity/voyage.entity';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
import { ContainerTariff } from '../entity/container-tariff.entity';

export const importOrderRepository = mssqlConnection.getRepository(ImportOrderEntity);
export const customerRepository = mssqlConnection.getRepository(CustomerEntity);
// export const voyageRepository = mssqlConnection.getRepository(VoyageEntity);
export const voyageContainerRepository = mssqlConnection.getRepository(VoyageContainerEntity);
export const contTariffRepository = mssqlConnection.getRepository(ContainerTariff);

export const getAllVoyageWithCustomerCanImportOrder = async () => {
  return await voyageContainerRepository
    .createQueryBuilder('cont')
    .select([
      'voy.ID AS ID',
      'voy.VESSEL_NAME AS VESSEL_NAME',
      'voy.ETA AS ETA',
      'cont.SHIPPER_ID AS SHIPPER_ID',
      'us.FULLNAME AS FULLNAME',
      'cus.TAX_CODE AS TAX_CODE',
      'COUNT(voy.ID) AS num_of_cont_can_import',
      'us.EMAIL AS EMAIL',
      'us.ADDRESS AS ADDRESS',
    ])
    .innerJoin('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pk.VOYAGE_CONTAINER_ID = cont.ID')
    .innerJoin('VOYAGE', 'voy', 'voy.ID = cont.VOYAGE_ID')
    .leftJoin('CUSTOMER', 'cus', 'cus.ID = cont.SHIPPER_ID')
    .leftJoin('USER', 'us', 'us.USERNAME = cus.USERNAME')
    .where('cont.STATUS = :status', { status: 'PENDING' })
    .andWhere('cus.CUSTOMER_TYPE = :type', { type: 'SHIPPER' })
    .andWhere('pk.STATUS = :pkStatus', { pkStatus: 'IN_CONTAINER' })
    .groupBy('voy.ID')
    .addGroupBy('voy.VESSEL_NAME')
    .addGroupBy('voy.ETA')
    .addGroupBy('cont.SHIPPER_ID')
    .addGroupBy('us.FULLNAME')
    .addGroupBy('cus.TAX_CODE')
    .addGroupBy('us.EMAIL')
    .addGroupBy('us.ADDRESS')
    .getRawMany();
};

const loadImportVesselAnhCustomer = async () => {
  const vesselList = await voyageContainerRepository
    .createQueryBuilder('cont')
    .select([
      'voy.ID AS ID',
      'voy.VESSEL_NAME AS VESSEL_NAME',
      'voy.ETA AS ETA',
      'cont.SHIPPER_ID AS SHIPPER_ID',
      'us.FULLNAME AS FULLNAME',
      'cus.TAX_CODE AS TAX_CODE',
      'COUNT(voy.ID) AS num_of_cont_can_import',
    ])
    .innerJoin('VOYAGE', 'voy', 'voy.ID = cont.VOYAGE_ID')
    .leftJoin('CUSTOMER', 'cus', 'cus.ID = cont.SHIPPER_ID')
    .leftJoin('USER', 'us', 'us.USERNAME = cus.USERNAME')
    .where('cont.STATUS = :status', { status: 'PENDING' })
    .groupBy('voy.ID')
    .addGroupBy('voy.VESSEL_NAME')
    .addGroupBy('voy.ETA')
    .addGroupBy('cont.SHIPPER_ID')
    .addGroupBy('us.FULLNAME')
    .addGroupBy('cus.TAX_CODE')
    .getRawMany();

  // const vesselList = await customerRepository
  //   .createQueryBuilder('cus')
  //   .leftJoin('VOYAGE_CONTAINER', 'cnt', 'cnt.SHIPPER_ID = cus.ID')
  //   .leftJoin('VOYAGE', 'voy', 'voy.ID = cnt.VOYAGE_ID')
  //   .where('cnt.STATUS = :status', { status: 'PENDING' })
  //   .select([
  //     'voy.ID as IDvoy',
  //     'voy.VESSEL_NAME as VESSEL_NAME',
  //     'voy.ETA as ETA',
  //     'cus.ID as IDcus',
  //   ])
  //   .groupBy('voy.ID')
  //   .addGroupBy('voy.VESSEL_NAME')
  //   .addGroupBy('voy.ETA')
  //   .addGroupBy('cus.ID')
  //   .getRawMany();

  const customerList = await customerRepository
    .createQueryBuilder('cus')
    .leftJoin('VOYAGE_CONTAINER', 'cnt', 'cnt.SHIPPER_ID = cus.ID')
    .leftJoin('VOYAGE', 'voy', 'voy.ID = cnt.VOYAGE_ID')
    .leftJoin('USER', 'us', 'us.USERNAME = cus.USERNAME')
    .where('cnt.STATUS = :status', { status: 'PENDING' })
    .select(['cus.ID as ID, us.FULLNAME as FULLNAME'])
    .groupBy('cus.ID')
    .addGroupBy('us.FULLNAME')
    .getRawMany();
  return {
    vesselList: vesselList,
    customerList: customerList,
  };
};

export type ContainerImLoad = {
  VOYAGE_ID: string;
  SHIPPER_ID: string;
};
const loadImportContainer = async (whereObj: ContainerImLoad) => {
  return await voyageContainerRepository
    .createQueryBuilder()
    .where('VOYAGE_ID = :voyage', { voyage: whereObj.VOYAGE_ID })
    .andWhere('SHIPPER_ID = :shipper', { shipper: whereObj.SHIPPER_ID })
    .andWhere('STATUS = :status', { status: 'PENDING' })
    .getMany();
};

const loadContInfoByID = async (arrayContID: string[]) => {
  return await voyageContainerRepository
    .createQueryBuilder()
    .where('ID IN (:...ids)', { ids: arrayContID })
    .getMany();
};

const getContainerTariff = async (whereObj: object) => {
  const tariffInfo = await contTariffRepository.find({ where: whereObj }).then(data => {
    let current = new Date();
    data = data.filter(item => {
      return current >= item.VALID_FROM && current <= item.VALID_UNTIL;
    });
    if (data.length == 1) {
      return data[0];
    } else {
      return null;
    }
  });
  return tariffInfo;
};

export const getContainerTariffV2 = async (whereObj: object) => {
  const currentDate = new Date();

  const results = await contTariffRepository
    .createQueryBuilder('tariff')
    .where('tariff.VALID_FROM <= :currentDate', { currentDate })
    .andWhere('tariff.VALID_UNTIL >= :currentDate', { currentDate })
    .andWhere(whereObj)
    .getOne();

  return results;
};

export { loadImportVesselAnhCustomer, loadImportContainer, loadContInfoByID, getContainerTariff };
