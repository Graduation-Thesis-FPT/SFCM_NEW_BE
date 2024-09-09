import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import menuController from '../../controllers/menu.controller';

const router = Router();

router.use(authentication);

router.get('', asyncHandler(menuController.getMenuByRoleCode));

export default router;
