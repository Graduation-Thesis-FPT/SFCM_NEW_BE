import { Router } from 'express';
import accessRoute from './access/index';
import menuRouter from './menu/index';
import permissionRoute from './permission/index';
import roleRoute from './role/index';
import userRoute from './user/index';

import blockRouter from './block/index';
import customerRouter from './customer/index';
import packageTypeRouter from './package-type/index';
import warehouseRouter from './warehouse/index';

import cellRouter from './cell/index';
import containerTariff from './container-tariff/index';
import packageCellAllocationRouter from './package-cell-allocation/index';
import packageTariffDetailRouter from './package-tariff-detail/index';
import packageTariffRouter from './package-tariff/index';
import voyageContainerPackageRouter from './voyage-container-package/index';
import voyageContainerRouter from './voyage-container/index';
import voyageRouter from './voyage/index';

import exportOrderRouter from './export-order/index';
import importContainerRouter from './import-order/index';
import importExportOrderRouter from './order/index';

const routes = Router();

// Health check
routes.get('/api/v1/health', (req, res) => {
  res.status(200).send('OK');
});

// Authentication & Authorization
routes.use('/api/v1/auth', accessRoute);
routes.use('/api/v1/user', userRoute);
routes.use('/api/v1/role', roleRoute);
routes.use('/api/v1/permission', permissionRoute);
routes.use('/api/v1/menu', menuRouter);

// Warehouse design
routes.use('/api/v1/warehouse', warehouseRouter);
//block
routes.use('/api/v1/block', blockRouter);
//customer
routes.use('/api/v1/customer', customerRouter);
//item-type
routes.use('/api/v1/package-type', packageTypeRouter);

//containerTariff
routes.use('/api/v1/container-tariff', containerTariff);

// voyage
routes.use('/api/v1/voyage', voyageRouter);

// voyage-container
routes.use('/api/v1/voyage-container', voyageContainerRouter);

// voyage-container-package
routes.use('/api/v1/voyage-container-package', voyageContainerPackageRouter);

//import-container
routes.use('/api/v1/import', importContainerRouter);
routes.use('/api/v1/export-order', exportOrderRouter);
routes.use('/api/v1/import-export-order', importExportOrderRouter);

// package cell allocation
routes.use('/api/v1/package-cell-allocation', packageCellAllocationRouter);

// cell
routes.use('/api/v1/cell', cellRouter);

// package tariff
routes.use('/api/v1/package-tariff', packageTariffRouter);

// package tariff detail
routes.use('/api/v1/package-tariff-detail', packageTariffDetailRouter);
export default routes;
