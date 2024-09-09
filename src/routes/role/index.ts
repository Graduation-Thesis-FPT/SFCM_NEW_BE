import { Router } from 'express';
import { asyncHandler } from '../../utils';
import roleController from '../../controllers/role.controller';
import { authentication } from '../../auth/authUtils';

const router = Router();

router.use(authentication);

router.get('', asyncHandler(roleController.getAllRole));
router.patch('');

export default router;
