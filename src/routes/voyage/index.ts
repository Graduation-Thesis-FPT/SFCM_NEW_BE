import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import { validateVoyageRequest } from '../../middlewares/helpers/voyageValidator';
import { grantPermission } from '../../middlewares';
import voyageController from '../../controllers/voyage.controller';

const router = Router();

router.use(authentication);

router.post(
  '',
  asyncHandler(grantPermission),
  validateVoyageRequest,
  asyncHandler(voyageController.createAndUpdateVoyage),
);
router.delete('', asyncHandler(grantPermission), asyncHandler(voyageController.deleteVoyage));
router.get('', asyncHandler(voyageController.getVoyage));

export default router;
