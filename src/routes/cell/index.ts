import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import cellController from '../../controllers/cell.controller';
import { grantPermission } from '../../middlewares';

const router = Router();

router.use(authentication);

router.get('', asyncHandler(cellController.suggestCell));
router.get('/available', asyncHandler(cellController.getAvailableCell));
router.patch('/place-package', asyncHandler(cellController.placePackageAllocatedIntoCell));
router.patch(
  '/change-package-position',
  asyncHandler(cellController.changePackageAllocatedPosition),
);
router.get('/package-position', asyncHandler(cellController.getAllPackagePosition));

export default router;
