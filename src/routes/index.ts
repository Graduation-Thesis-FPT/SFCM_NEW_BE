import { Router } from 'express';
import accessRoute from './access/index';
import userRoute from './user/index';
import roleRoute from './role/index';
import permissionRoute from './permission/index';
import menuRouter from './menu/index';

import warehouseRouter from './warehouse/index';
import blockRouter from './block/index';
import customerRouter from './customer/index';
import packageTypeRouter from './package-type/index';
import voyageRouter from './voyage/index';
import voyageContainerRouter from './voyage-container/index';

const routes = Router();

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

// voyage
routes.use('/api/v1/voyage', voyageRouter);

// voyage-container
routes.use('/api/v1/voyage-container', voyageContainerRouter);

export default routes;
