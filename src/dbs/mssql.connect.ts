import { DataSource } from 'typeorm';
import { Block } from '../entity/block.entity';
import { Cell } from '../entity/cell.entity';
import { ContainerTariff } from '../entity/container-tariff.entity';
import { Customer } from '../entity/customer.entity';
import { Menu } from '../entity/menu.entity';
import { PackageCellAllocationEntity } from '../entity/package-cell-allocation.entity';
import { PackageTariffEntity } from '../entity/package-tariff.entity';
import { PackageType } from '../entity/package-type.entity';
import { Permission } from '../entity/permission.entity';
import { Role } from '../entity/role.entity';
import { User } from '../entity/user.entity';
import { VoyageContainerPackageEntity } from '../entity/voyage-container-package.entity';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
import { VoyageEntity } from '../entity/voyage.entity';
import { WareHouse } from '../entity/warehouse.entity';
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
    VoyageContainerPackageEntity,
    PackageCellAllocationEntity,
    PackageTariffEntity
  ],
  options: {
    encrypt: false,
  },
});

export default mssqlConnection;
