import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { VoyageContainer } from '../models/voyage-container.model';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
import { VoyageEntity } from '../entity/voyage.entity';

export const containerRepository = mssqlConnection.getRepository(VoyageContainerEntity);
export const voyageRepository = mssqlConnection.getRepository(VoyageEntity);

export const checkPackageInCont = async (containerId: string) => {
  return await containerRepository
    .createQueryBuilder('cn')
    .innerJoin('VOYAGE_CONTAINER_PACKAGE', 'pk', 'cn.ID = pk.VOYAGE_CONTAINER_ID')
    .where('pk.VOYAGE_CONTAINER_ID = :containerId', { containerId: containerId })
    .getRawOne();
};

const createVoyageContainer = async (
  containerListInfo: VoyageContainer[],
  transactionEntityManager: EntityManager,
) => {
  const container = containerRepository.create(containerListInfo);

  const newVoyageContainer = await transactionEntityManager.save(container);
  return newVoyageContainer;
};

const updateVoyageContainer = async (
  containerListInfo: VoyageContainer[],
  transactionEntityManager: EntityManager,
) => {
  return await Promise.all(
    containerListInfo.map(container =>
      transactionEntityManager.update(VoyageContainerEntity, container.ID, container),
    ),
  );
};

const findVoyageContainerById = async (
  containerCode: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(VoyageContainerEntity, 'voyageContainer')
    .where('voyageContainer.ID = :containerCode', { containerCode: containerCode })
    .getOne();
};

const findVoyageContainer = async (containerRowId: string) => {
  return await containerRepository
    .createQueryBuilder('voyageContainer')
    .where('voyageContainer.ID = :containerRowId', { containerRowId: containerRowId })
    .getOne();
};

const deleteVoyageContainerMany = async (containerCode: string[]) => {
  return await containerRepository.delete(containerCode);
};

const filterVoyageContainer = async (rule: any) => {
  const filterObj = rule;
  return await containerRepository.find({
    where: filterObj,
    order: {
      UPDATED_AT: 'DESC',
    },
  });
};

const isUniqueVoyageContainer = async (
  voyagekey: string,
  cntrno: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(VoyageContainerEntity, 'container')
    .leftJoin('DT_VESSEL_VISIT', 'sp', 'sm.VOYAGEKEY = sp.VOYAGEKEY')
    .where('container.VOYAGEKEY = :voyagekey', { voyagekey: voyagekey })
    .andWhere('container.CNTRNO = :cntrno', { cntrno: cntrno })
    .getOne();
};

const isDuplicateVoyageContainer = async (
  voyageID: string,
  cntrNo: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(VoyageContainerEntity, 'voyageContainer')
    .select('voyageContainer.VOYAGE_ID', 'VOYAGE_ID')
    .addSelect('voyageContainer.CNTR_NO', 'CNTR_NO')
    // .leftJoin('VOYAGE', 'voyage', 'voyageContainer.VOYAGE_ID = voyage.ID')
    // .addSelect('voyage.VESSEL_NAME', 'VESSEL_NAME')
    // .addSelect('voyage.ETA', 'ETA')
    .where('voyageContainer.VOYAGE_ID = :voyageID', { voyageID })
    .andWhere('voyageContainer.CNTR_NO = :cntrNo', { cntrNo })
    .getRawOne();
};

const isVoyageContainerExecuted = async (containerId: string) => {
  const container = await containerRepository
    .createQueryBuilder('cn')
    .innerJoin('DELIVER_ORDER', 'do', 'cn.ROWGUID = do.CONTAINER_ID')
    .where('cn.ROWGUID = :containerId', { containerId })
    .select([
      'cn.ROWGUID as ROWGUID',
      'do.DE_ORDER_NO as DE_ORDER_NO',
      'do.CONTAINER_ID as CONTAINER_ID',
    ])
    .getRawOne();

  return container;
};

export const checkIsContPayment = async (contID: string) => {
  return await voyageRepository
    .createQueryBuilder('voy')
    .select(
      "CASE WHEN pay.STATUS = 'PENDING' THEN CONCAT(N'Container ', cont.CNTR_NO, N' đang chờ xác nhận thanh toán')" +
        "WHEN pay.STATUS = 'PAID' THEN CONCAT(N'Container ', cont.CNTR_NO, N' đã làm lệnh') END",
      'message',
    )
    .innerJoin('VOYAGE_CONTAINER', 'cont', 'cont.VOYAGE_ID = voy.ID')
    .innerJoin('IMPORT_ORDER_DETAIL', 'iod', 'iod.VOYAGE_CONTAINER_ID = cont.ID')
    .innerJoin('IMPORT_ORDER', 'io', 'io.ID = iod.ORDER_ID')
    .innerJoin('IMPORT_ORDER_PAYMENT', 'pay', 'pay.ID = io.PAYMENT_ID')
    .where('cont.ID = :contID', { contID: contID })
    .andWhere('pay.STATUS != :payStatus', { payStatus: 'CANCELLED' })
    .andWhere('io.STATUS = :ioStatus', { ioStatus: 'COMPLETED' })
    .getRawOne();
};

export {
  createVoyageContainer,
  updateVoyageContainer,
  findVoyageContainerById,
  filterVoyageContainer,
  deleteVoyageContainerMany,
  findVoyageContainer,
  isUniqueVoyageContainer,
  isDuplicateVoyageContainer,
  isVoyageContainerExecuted,
};
