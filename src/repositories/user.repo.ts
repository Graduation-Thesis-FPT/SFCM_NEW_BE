import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { Role } from '../entity/role.entity';
import { User as UserEntity } from '../entity/user.entity';

export const userRepository = mssqlConnection.getRepository(UserEntity);

const findUserByUserName = async (userName: string): Promise<UserEntity> => {
  // return await userRepository.findOne({
  //   where: { USERNAME: userName },
  // });

  return await userRepository
    .createQueryBuilder('user')
    .select([
      'user.USERNAME as USERNAME',
      'user.FULLNAME as FULLNAME',
      'user.EMAIL as EMAIL',
      'user.TELEPHONE as TELEPHONE',
      'user.ADDRESS as ADDRESS',
      'user.BIRTHDAY as BIRTHDAY',
      'user.IS_ACTIVE as IS_ACTIVE',
      'user.CREATED_AT as CREATED_AT',
      'user.CREATED_BY as CREATED_BY',
      'user.UPDATED_AT as UPDATED_AT',
      'user.UPDATED_BY as UPDATED_BY',
      'user.ROLE_CODE as ROLE_CODE',
    ])
    .where('USERNAME = :USERNAME', { USERNAME: userName })
    .getRawOne();
};

const findUserById = async (userId: string): Promise<UserEntity> => {
  const user = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect(Role, 'role', 'user.ROLE_CODE = role.ROLE_CODE')
    .select([
      'user.USERNAME as USERNAME',
      'user.FULLNAME as FULLNAME',
      'user.EMAIL as EMAIL',
      'user.TELEPHONE as TELEPHONE',
      'user.ADDRESS as ADDRESS',
      'user.BIRTHDAY as BIRTHDAY',
      'user.IS_ACTIVE as IS_ACTIVE',
      'user.CREATED_AT as CREATED_AT',
      'user.CREATED_BY as CREATED_BY',
      'user.UPDATED_AT as UPDATED_AT',
      'user.UPDATED_BY as UPDATED_BY',
      'user.ROLE_CODE as ROLE_CODE',
      'role.ROLE_NAME as ROLE_NAME',
    ])
    .where('user.USERNAME = :USERNAME', { USERNAME: userId })
    .getRawOne();

  return user;
};

const getAllUser = async (): Promise<UserEntity[]> => {
  return await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect(Role, 'role', 'user.ROLE_CODE = role.ROLE_CODE')
    .select([
      'user.USERNAME as USERNAME',
      'user.FULLNAME as FULLNAME',
      'user.EMAIL as EMAIL',
      'user.TELEPHONE as TELEPHONE',
      'user.ADDRESS as ADDRESS',
      'user.BIRTHDAY as BIRTHDAY',
      'user.IS_ACTIVE as IS_ACTIVE',
      'user.CREATED_AT as CREATED_AT',
      'user.CREATED_BY as CREATED_BY',
      'user.UPDATED_AT as UPDATED_AT',
      'user.UPDATED_BY as UPDATED_BY',
      'user.ROLE_CODE as ROLE_CODE',
      'role.ROLE_NAME as ROLE_NAME',
    ])
    .where('user.ROLE_CODE != :ROLE_CODE', { ROLE_CODE: 'customer' })
    .orderBy('user.UPDATED_AT', 'DESC')
    .getRawMany();
};

// delete forever
const deleteUser = async (userId: string) => {
  return await userRepository
    .createQueryBuilder()
    .delete()
    .from(UserEntity)
    .where('USERNAME = :USERNAME', { USERNAME: userId })
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
    .where('USERNAME = :USERNAME', { USERNAME: userId })
    .execute();
};

// active
const activeUser = async (userId: string) => {
  return await userRepository
    .createQueryBuilder()
    .update(UserEntity)
    .set({ IS_ACTIVE: true })
    .where('USERNAME = :USERNAME', { USERNAME: userId })
    .execute();
};

const updateUser = async (userId: string, userInfor: Partial<UserEntity>) => {
  return await userRepository.update(userId, userInfor);
};

const checkPasswordIsNullById = async (userId: string) => {
  const user = await userRepository
    .createQueryBuilder('user')
    .select('user.USERNAME')
    .where('user.USERNAME = :USERNAME', { USERNAME: userId })
    .andWhere('user.PASSWORD IS NULL')
    .getOne();
  return user !== null; // Trả về true nếu user có password là null, ngược lại trả về false
};

const updatePasswordById = async (userId: string, password: string) => {
  return await userRepository
    .createQueryBuilder()
    .update(UserEntity)
    .set({ PASSWORD: password })
    .where('USERNAME = :USERNAME', { USERNAME: userId })
    .execute();
};

const getUserWithPasswordById = async (userId: string) => {
  return await userRepository
    .createQueryBuilder('user')
    .addSelect('user.PASSWORD')
    .where('user.USERNAME = :USERNAME', { USERNAME: userId })
    .getOne();
};

const resetPasswordById = async (userId: string) => {
  return await userRepository.update(userId, { PASSWORD: null });
};

const getUsersByUserNames = async (userNames: string[]): Promise<UserEntity[]> => {
  return await userRepository
    .createQueryBuilder('user')
    .select(['user.ROWGUID', 'user.USERNAME'])
    .where('user.USERNAME IN (:...names)', { names: userNames })
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
