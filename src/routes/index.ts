import { Router } from 'express';
import accessRoute from './access/index';
import userRoute from './user/index';
import roleRoute from './role/index';
import permissionRoute from './permission/index';
import menuRouter from './menu/index';
const routes = Router();

// Authentication & Authorization
routes.use('/api/v1/auth', accessRoute);
routes.use('/api/v1/user', userRoute);
routes.use('/api/v1/role', roleRoute);
routes.use('/api/v1/permission', permissionRoute);
routes.use('/api/v1/menu', menuRouter);

// Warehouse design

export default routes;
