import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { Role } from '../entity/role.entity';
import { User as UserEntity } from '../entity/user.entity';

export const userRepository = mssqlConnection.getRepository(UserEntity);

const findUserByUserName = async (userName: string): Promise<UserEntity> => {
  return await userRepository.findOne({
    where: { USER_NAME: userName },
  });
};

const findUserById = async (userId: string): Promise<UserEntity> => {
  const user = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect(Role, 'role', 'user.ROLE_CODE = role.ROLE_CODE')
    .select([
      'user.ROWGUID as ROWGUID',
      'user.USER_NAME as USER_NAME',
      'user.FULLNAME as FULLNAME',
      'user.EMAIL as EMAIL',
      'user.TELEPHONE as TELEPHONE',
      'user.ADDRESS as ADDRESS',
      'user.BIRTHDAY as BIRTHDAY',
      'user.IS_ACTIVE as IS_ACTIVE',
      'user.CREATE_DATE as CREATE_DATE',
      'user.CREATE_BY as CREATE_BY',
      'user.UPDATE_DATE as UPDATE_DATE',
      'user.UPDATE_BY as UPDATE_BY',
      'user.ROLE_CODE as ROLE_CODE',
      'role.ROLE_NAME as ROLE_NAME',
    ])
    .where('user.ROWGUID = :ROWGUID', { ROWGUID: userId })
    .getRawOne();

  return user;
};

const getAllUser = async (): Promise<UserEntity[]> => {
  return await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect(Role, 'role', 'user.ROLE_CODE = role.ROLE_CODE')
    .select([
      'user.ROWGUID as ROWGUID',
      'user.USER_NAME as USER_NAME',
      'user.FULLNAME as FULLNAME',
      'user.EMAIL as EMAIL',
      'user.TELEPHONE as TELEPHONE',
      'user.ADDRESS as ADDRESS',
      'user.BIRTHDAY as BIRTHDAY',
      'user.IS_ACTIVE as IS_ACTIVE',
      'user.CREATE_DATE as CREATE_DATE',
      'user.CREATE_BY as CREATE_BY',
      'user.UPDATE_DATE as UPDATE_DATE',
      'user.UPDATE_BY as UPDATE_BY',
      'user.ROLE_CODE as ROLE_CODE',
      'role.ROLE_NAME as ROLE_NAME',
    ])
    .where('user.ROLE_CODE != :ROLE_CODE', { ROLE_CODE: 'customer' })
    .orderBy('user.UPDATE_DATE', 'DESC')
    .getRawMany();
};

// delete forever
const deleteUser = async (userId: string) => {
  return await userRepository
    .createQueryBuilder()
    .delete()
    .from(UserEntity)
    .where('ROWGUID = :ROWGUID', { ROWGUID: userId })
    .execute();
};

const deleteUsers = async (userNames: string[]): Promise<void> => {
  await userRepository
    .createQueryBuilder()
    .delete()
    .from('user_table')
    .where('userName IN (:...names)', { names: userNames })
    .execute();
};

// deactive
const deactiveUser = async (userId: string) => {
  return await userRepository
    .createQueryBuilder()
    .update(UserEntity)
    .set({ IS_ACTIVE: false })
    .where('ROWGUID = :ROWGUID', { ROWGUID: userId })
    .execute();
};

// active
const activeUser = async (userId: string) => {
  return await userRepository
    .createQueryBuilder()
    .update(UserEntity)
    .set({ IS_ACTIVE: true })
    .where('ROWGUID = :ROWGUID', { ROWGUID: userId })
    .execute();
};

const updateUser = async (userId: string, userInfor: Partial<UserEntity>) => {
  return await userRepository.update(userId, userInfor);
};

const checkPasswordIsNullById = async (userId: string) => {
  const user = await userRepository
    .createQueryBuilder('user')
    .select('user.ROWGUID')
    .where('user.ROWGUID = :ROWGUID', { ROWGUID: userId })
    .andWhere('user.PASSWORD IS NULL')
    .getOne();
  return user !== null; // Trả về true nếu user có password là null, ngược lại trả về false
};

const updatePasswordById = async (userId: string, password: string) => {
  return await userRepository
    .createQueryBuilder()
    .update(UserEntity)
    .set({ PASSWORD: password })
    .where('ROWGUID = :ROWGUID', { ROWGUID: userId })
    .execute();
};

const getUserWithPasswordById = async (userId: string) => {
  return await userRepository
    .createQueryBuilder('user')
    .addSelect('user.PASSWORD')
    .where('user.ROWGUID = :ROWGUID', { ROWGUID: userId })
    .getOne();
};

const resetPasswordById = async (userId: string) => {
  return await userRepository.update(userId, { PASSWORD: null });
};

const getUsersByUserNames = async (userNames: string[]): Promise<UserEntity[]> => {
  return await userRepository
    .createQueryBuilder('user')
    .select(['user.ROWGUID', 'user.USER_NAME'])
    .where('user.USER_NAME IN (:...names)', { names: userNames })
    .getMany();
};

const createUser = async (user: UserEntity, transactionalEntityManager: EntityManager) => {
  return await transactionalEntityManager.save(user);
};

export {
  activeUser,
  checkPasswordIsNullById,
  deactiveUser,
  deleteUser,
  deleteUsers,
  findUserById,
  findUserByUserName,
  getAllUser,
  getUserWithPasswordById,
  resetPasswordById,
  updatePasswordById,
  updateUser,
  getUsersByUserNames,
  createUser,
};
