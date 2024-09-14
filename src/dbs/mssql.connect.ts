import { DataSource } from 'typeorm';
import { Role } from '../entity/role.entity';
import { Permission } from '../entity/permission.entity';
import { Menu } from '../entity/menu.entity';
import { User } from '../entity/user.entity';
import { WareHouse } from '../entity/warehouse.entity';
import { Block } from '../entity/block.entity';
import { Cell } from '../entity/cell.entity';
import { Customer } from '../entity/customer.entity';
import { PackageType } from '../entity/package-type.entity';
import { ContainerTariff } from '../entity/container-tariff.entity';
import { VoyageEntity } from '../entity/voyage.entity';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
const mssqlConnection = new DataSource({
  type: 'mssql',
  host: process.env.DB_SERVER,
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Role,
    Permission,
    Menu,
    WareHouse,
    Block,
    Cell,
    Customer,
    PackageType,
    ContainerTariff,
    VoyageEntity,
    VoyageContainerEntity,
  ],
  options: {
    encrypt: false,
  },
});

export default mssqlConnection;
