import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import voyageContainerPackageController from '../../controllers/voyage-container-package.controller';
import { validateVoyageContainerPackageRequest } from '../../middlewares/helpers/voyageContainerPackageValidator';
import { grantPermission } from '../../middlewares';

const router = Router();

router.use(authentication);

router.post(
  '',
  asyncHandler(grantPermission),
  validateVoyageContainerPackageRequest,
  asyncHandler(voyageContainerPackageController.createAndUpdateVoyageContainerPackage),
);
router.delete(
  '',
  asyncHandler(grantPermission),
  asyncHandler(voyageContainerPackageController.deleteVoyageContainerPackage),
);
router.get('', asyncHandler(voyageContainerPackageController.getVoyageContainerPackage));

export default router;
