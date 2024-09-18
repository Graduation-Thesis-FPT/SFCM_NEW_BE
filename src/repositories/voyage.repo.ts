import { Between, EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
import { Voyage } from '../models/voyage.model';
import { VoyageEntity } from '../entity/voyage.entity';

export const voyageRepository = mssqlConnection.getRepository(VoyageEntity);
const containerReposiory = mssqlConnection.getRepository(VoyageContainerEntity);

const createVoyage = async (
  voyageListInfo: Voyage[],
  transactionalEntityManager: EntityManager,
) => {
  const vessel = voyageRepository.create(voyageListInfo);

  const newVoyage = await transactionalEntityManager.save(vessel);
  return newVoyage;
};

const updateVoyage = async (
  voyageListInfo: Voyage[],
  transactionalEntityManager: EntityManager,
) => {
  return await Promise.all(
    voyageListInfo.map(vessel =>
      transactionalEntityManager.update(VoyageEntity, vessel.ID, vessel),
    ),
  );
};

const findVoyageByID = async (voyageID: string, transactionalEntityManager: EntityManager) => {
  return await transactionalEntityManager
    .createQueryBuilder(VoyageEntity, 'vessel')
    .where('vessel.ID = :voyageID', { voyageID })
    .getOne();
};

const findVoyage = async (vesselID: string) => {
  return await voyageRepository
    .createQueryBuilder('voyage')
    .where('voyage.ID = :vesselID', {
      vesselID,
    })
    .getOne();
};

const deleteVoyageMany = async (vesselCode: string[]) => {
  return await voyageRepository.delete(vesselCode);
};

const getAllVoyage = async (rule: { fromDate: Date; toDate: Date }) => {
  let filterObj = {};
  if (rule?.fromDate && rule?.toDate) filterObj = { ETA: Between(rule?.fromDate, rule?.toDate) };
  return await voyageRepository.find({
    where: filterObj,
    order: {
      UPDATED_AT: 'DESC',
    },
  });
};

const findVoyageInBoundVoyage = async (
  vesselInboundVoyage: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(VoyageEntity, 'vessel')
    .where('vessel.INBOUND_VOYAGE = :vesselInboundVoyage', { vesselInboundVoyage })
    .getOne();
};

const findContainerByVoyageKey = async (
  voyageKey: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(VoyageContainerEntity, 'container')
    .where('container.VOYAGEKEY = :voyageKey', {
      voyageKey: voyageKey,
    })
    .getOne();
};

const findContainerByVoyageKeyy = async (voyageKey: string) => {
  return await containerReposiory
    .createQueryBuilder('container')
    .where('container.VOYAGEKEY = :voyageKey', {
      voyageKey: voyageKey,
    })
    .getOne();
};

export {
  createVoyage,
  updateVoyage,
  findVoyageByID,
  deleteVoyageMany,
  getAllVoyage,
  findVoyage,
  findVoyageInBoundVoyage,
  findContainerByVoyageKey,
  findContainerByVoyageKeyy,
};
