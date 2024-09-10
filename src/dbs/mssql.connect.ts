import { DataSource } from 'typeorm';
import { Role } from '../entity/role.entity';
import { Permission } from '../entity/permission.entity';
import { Menu } from '../entity/menu.entity';
import { WareHouse } from '../entity/warehouse.entity';

const mssqlConnection = new DataSource({
  type: 'mssql',
  host: process.env.DB_SERVER,
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    // User,
    Role,
    Permission,
    Menu,
    WareHouse,
  ],
  options: {
    encrypt: false,
  },
});

export default mssqlConnection;
