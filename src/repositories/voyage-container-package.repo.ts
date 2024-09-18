import { EntityManager, Not } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { VoyageContainerPackageEntity } from '../entity/voyage-container-package.entity';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
import { VoyageContainerPackage } from '../models/voyage-container-package';
// import { palletRepository } from '.';
// import { updateCanCancelExport } from './delivery-order.repo';

export const containerRepository = mssqlConnection.getRepository(VoyageContainerEntity);
export const packageRepository = mssqlConnection.getRepository(VoyageContainerPackageEntity);

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

const getVoyageContainerPackage = async (refContainer: string) => {
  return await packageRepository.find({
    select: {
      ID: true,
      HOUSE_BILL: true,
      PACKAGE_TYPE_ID: true,
      PACKAGE_UNIT: true,
      TOTAL_ITEMS: true,
      CBM: true,
      VOYAGE_CONTAINER_ID: true,
      NOTE: true,
    },
    order: {
      UPDATED_AT: 'DESC',
    },
    where: { VOYAGE_CONTAINER_ID: refContainer },
  });
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
