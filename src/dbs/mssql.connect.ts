import { DataSource } from 'typeorm';
import { Role } from '../entity/role.entity';
import { Permission } from '../entity/permission.entity';
import { Menu } from '../entity/menu.entity';
import { WareHouse } from '../entity/warehouse.entity';
import { Gate } from '../entity/gate.entity';
import { EquipmentType } from '../entity/equipment-type.entity';
import { Equipment } from '../entity/equipment.entity';
import { MethodEntity } from '../entity/method.entity';
import { Cell } from '../entity/cell.entity';
import { Block } from '../entity/block.entity';
import { ItemType } from '../entity/item-type.entity';
import { CustomerType } from '../entity/customer-type.entity';
import { Customer } from '../entity/customer.entity';
import { Vessel } from '../entity/vessel.entity';
import { ContainerEntity } from '../entity/container.entity';
import { User } from '../entity/user.entity';
import { Package } from '../entity/package.entity';
import { TariffCodeEntity } from '../entity/tariff-code.entity';
import { TariffEntity } from '../entity/tariff.entity';
import { TariffTempEntity } from '../entity/tariff-temp.entity';
import { ConfigAttachSrvEntity } from '../entity/config-attach-srv.entity';
import { DiscountTariffEntity } from '../entity/discount-tariff.entity';
import { PackageUnit } from '../entity/packge-unit.entity';
import { DeliverOrderEntity } from '../entity/deliver-order.entity';
import { DeliveryOrderDtlEntity } from '../entity/delivery-order-detail.entity';
import { JobQuantityCheckEntity } from '../entity/job-quantity-check.entity';
import { PalletStockEntity } from '../entity/pallet-stock.entity';
import { InvNoEntity } from '../entity/inv_vat.entity';
import { InvNoDtlEntity } from '../entity/inv_vat_dtl.entity';
import { TariffDisEntity } from '../entity/tariffDis.entity';

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
    Cell,
    Gate,
    EquipmentType,
    Equipment,
    MethodEntity,
    Block,
    ItemType,
    PackageUnit,
    CustomerType,
    Customer,
    Vessel,
    ContainerEntity,
    Package,
    TariffCodeEntity,
    TariffEntity,
    TariffTempEntity,
    ConfigAttachSrvEntity,
    DiscountTariffEntity,
    DeliverOrderEntity,
    JobQuantityCheckEntity,
    PalletStockEntity,
    DeliveryOrderDtlEntity,
    InvNoEntity,
    InvNoDtlEntity,
    TariffDisEntity,
  ],
  options: {
    encrypt: false,
  },
});

export default mssqlConnection;
