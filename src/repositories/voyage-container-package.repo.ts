import { EntityManager, Not } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { VoyageContainerPackageEntity } from '../entity/voyage-container-package.entity';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
import { VoyageContainerPackage } from '../models/voyage-container-package';
import { manager } from './index.repo';
// import { palletRepository } from '.';
// import { updateCanCancelExport } from './delivery-order.repo';

export const containerRepository = mssqlConnection.getRepository(VoyageContainerEntity);
export const packageRepository = mssqlConnection.getRepository(VoyageContainerPackageEntity);

export const updateStatusVoyContPackageById = async (
  ID: string,
  newStatus: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager
    .createQueryBuilder()
    .update(VoyageContainerPackageEntity)
    .set({ STATUS: newStatus })
    .where('ID = :ID', { ID })
    .execute();
};

// check them dieu kien insert update
const check4AddnUpdate = async (pack: VoyageContainerPackage) => {
  let whereObj: any = {
    VOYAGE_CONTAINER_ID: pack.VOYAGE_CONTAINER_ID,
    HOUSE_BILL: pack.HOUSE_BILL,
  };
  pack.ID ? (whereObj['ID'] = Not(pack.ID)) : '';
  const checkExist = await packageRepository.find({
    where: whereObj,
  });
  if (!checkExist.length) return false;
  return true;
};

const checkHouseBillExisted = async (houseBill: string, voyageContainerId: string) => {
  const checkExist = await packageRepository.find({
    where: { HOUSE_BILL: houseBill, VOYAGE_CONTAINER_ID: voyageContainerId },
  });
  if (!checkExist.length) return false;
  return true;
};

// const check4UpdatenDelete = async (refcont: string) => {
//   const isSuccess = await containerRepository.find({
//     where: { ID: refcont, STATUS: false },
//   });
//   if (!isSuccess.length) return false;
//   return true;
// };
/// here
const createVoyageContainerPackage = async (
  packageListInfo: VoyageContainerPackage[],
  transactionalEntityManager: EntityManager,
) => {
  const packagee = packageRepository.create(packageListInfo);
  return transactionalEntityManager.save(packagee);
};

const updateVoyageContainerPackage = async (
  packageListInfo: VoyageContainerPackage[],
  transactionalEntityManager: EntityManager,
) => {
  return await Promise.all(
    packageListInfo.map(packageData =>
      transactionalEntityManager.update(VoyageContainerPackageEntity, packageData.ID, packageData),
    ),
  );
};

const updateVoyageContainerPackageTimeIn = async (
  voyageContainerPackageId: VoyageContainerPackage,
  createBy: string,
) => {
  return await packageRepository
    .createQueryBuilder('package')
    .update(VoyageContainerPackageEntity)
    .set({
      TIME_IN: new Date(),
      UPDATED_BY: createBy,
      STATUS: 'IN_WAREHOUSE',
    })
    .where('ID = :ID', { ID: voyageContainerPackageId.ID })
    .execute();
};

// const updateVoyageContainerPackageTimeOut = async (
//   packageData: VoyageContainerPackage,
//   createBy: string,
// ) => {
//   await updateCanCancelExport(packageData.ROWGUID);
//   return await packageRepository
//     .createQueryBuilder('package')
//     .update(VoyageContainerPackageEntity)
//     .set({
//       TIME_OUT: new Date(),
//       UPDATE_BY: createBy,
//     })
//     .where('ROWGUID = :ROWGUID', { ROWGUID: packageData.ROWGUID })
//     .execute();
// };

const getVoyageContainerPackage = async (voyageContID: string) => {
  return await packageRepository
    .createQueryBuilder('package')
    .select([
      'package.ID',
      'package.HOUSE_BILL',
      'package.PACKAGE_TYPE_ID',
      'package.PACKAGE_UNIT',
      'package.TOTAL_ITEMS',
      'package.CBM',
      'package.VOYAGE_CONTAINER_ID',
      'package.NOTE',
      'package.STATUS',
      'package.CONSIGNEE_ID',
    ])
    .where('package.VOYAGE_CONTAINER_ID = :voyageContID', { voyageContID })
    .orderBy(
      'CASE ' +
        "WHEN package.STATUS = 'IN_CONTAINER' THEN 1 " +
        "WHEN package.STATUS = 'ALLOCATING' THEN 2 " +
        "WHEN package.STATUS = 'IN_WAREHOUSE' THEN 3 " +
        "WHEN package.STATUS = 'OUT_FOR_DELIVERY' THEN 4 " +
        'ELSE 5 END',
    )
    .addOrderBy('package.UPDATED_AT', 'DESC')
    .getMany();
};

const deleteVoyageContainerPackage = async (packgeListId: string[]) => {
  return await packageRepository.delete(packgeListId);
};

// const findVoyageContainerPackageByPalletNo = async (palletNo: string) => {
//   return await palletRepository
//     .createQueryBuilder('pallet')
//     .innerJoinAndSelect('JOB_QUANTITY_CHECK', 'job', 'job.ROWGUID = pallet.JOB_QUANTITY_ID')
//     .innerJoinAndSelect('DT_PACKAGE_MNF_LD', 'package', 'package.ROWGUID = job.PACKAGE_ID')
//     .where('pallet.PALLET_NO = :palletNo', { palletNo })
//     .select([
//       'package.ROWGUID as ROWGUID',
//       'package.HOUSE_BILL as HOUSE_BILL',
//       'package.ITEM_TYPE_CODE as ITEM_TYPE_CODE',
//       'package.PACKAGE_UNIT_CODE as PACKAGE_UNIT_CODE',
//       'package.CARGO_PIECE as CARGO_PIECE',
//       'package.CBM as CBM',
//       'package.DECLARE_NO as DECLARE_NO',
//       'package.CONTAINER_ID as CONTAINER_ID',
//       'package.NOTE as NOTE',
//     ])
//     .limit(1)
//     .getRawOne();
// };

const findVoyageContainerPackage = async (rowId: string) => {
  return await packageRepository
    .createQueryBuilder('package')
    .leftJoinAndSelect('BS_ITEM_TYPE', 'item', 'package.ITEM_TYPE_CODE = item.ITEM_TYPE_CODE')
    .where('package.ROWGUID = :rowId', { rowId })
    .select([
      'package.ROWGUID as ROWGUID',
      'package.HOUSE_BILL as HOUSE_BILL',
      'package.ITEM_TYPE_CODE as ITEM_TYPE_CODE',
      'package.PACKAGE_UNIT_CODE as PACKAGE_UNIT_CODE',
      'package.CARGO_PIECE as CARGO_PIECE',
      'package.CBM as CBM',
      'package.DECLARE_NO as DECLARE_NO',
      'package.CONTAINER_ID as CONTAINER_ID',
      'package.NOTE as NOTE',
      'item.ITEM_TYPE_NAME as ITEM_TYPE_NAME',
      'package.TIME_IN as TIME_IN',
      'package.TIME_OUT as TIME_OUT',
    ])
    .getRawOne();
};

export const getVoyageContainerPackagesByIds = async (voyageContainerPackageIds: string[]) => {
  return await packageRepository
    .createQueryBuilder()
    .where('ID IN (:...ids)', { ids: voyageContainerPackageIds })
    .getMany();
};

export const getVoyageContainerPackagesWithTariffs = async (
  voyageContainerPackageIds: string[],
  packageTariffId: string,
) => {
  return await manager
    .createQueryBuilder('VOYAGE_CONTAINER_PACKAGE', 'vcp')
    .leftJoinAndSelect('PACKAGE_TARIFF_DETAIL', 'ptd', 'ptd.PACKAGE_TYPE_ID = vcp.PACKAGE_TYPE_ID')
    .where('ID IN (:...ids)', { ids: voyageContainerPackageIds })
    .andWhere('ptd.PACKAGE_TARIFF_ID = :packageTariffId', { packageTariffId })
    .andWhere("ptd.STATUS = 'ACTIVE'")
    .select([
      'vcp.ID as ID',
      'vcp.HOUSE_BILL as HOUSE_BILL',
      'vcp.PACKAGE_TYPE_ID as PACKAGE_TYPE_ID',
      'vcp.CBM as CBM',
      'vcp.TIME_IN as TIME_IN',
      'ptd.UNIT_PRICE as UNIT_PRICE',
      'ptd.VAT_RATE as VAT_RATE',
      'ptd.ROWGUID as PACKAGE_TARIFF_DETAIL_ID',
    ])
    .getRawMany();
};

const getAllVoyagePackageByStatus = async (voyageContainerId: string, status: string) => {
  const voyagePackage = await packageRepository
    .createQueryBuilder('package')
    .where('package.STATUS = :status', { status })
    .andWhere('package.VOYAGE_CONTAINER_ID = :voyageContainerId', { voyageContainerId })
    .getRawMany();

  return voyagePackage;
};

const findVoyageContainerPackageById = async (rowId: string) => {
  return await packageRepository.findOne({
    where: { ID: rowId },
  });
};

export {
  check4AddnUpdate,
  // updateVoyageContainerPackageTimeOut,
  checkHouseBillExisted,
  // check4UpdatenDelete,
  createVoyageContainerPackage,
  deleteVoyageContainerPackage,
  findVoyageContainerPackage,
  getVoyageContainerPackage,
  updateVoyageContainerPackage,
  // findVoyageContainerPackageByPalletNo,
  updateVoyageContainerPackageTimeIn,
  getAllVoyagePackageByStatus,
  findVoyageContainerPackageById,
};
