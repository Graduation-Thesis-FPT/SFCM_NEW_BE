import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import itemtypeController from '../../controllers/package-type.controller';
import { grantPermission } from '../../middlewares';
import { validateItemTypeRequest } from '../../middlewares/helpers/item-typeValidation';

const router = Router();

router.use(authentication);

router.post(
  '',
  asyncHandler(grantPermission),
  validateItemTypeRequest,
  asyncHandler(itemtypeController.createItemType),
);
router.delete('', asyncHandler(grantPermission), asyncHandler(itemtypeController.deleteItemType));
router.get('', asyncHandler(itemtypeController.getItemType));

export default router;
