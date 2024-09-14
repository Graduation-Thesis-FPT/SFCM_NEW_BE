import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import voyageContainerRepository from '../../controllers/voyage-container.controller';
import { validateVoyageContainerRequest } from '../../middlewares/helpers/voyageContainerValidator';
import { grantPermission } from '../../middlewares';

const router = Router();

router.use(authentication);

router.post(
  '',
  asyncHandler(grantPermission),
  validateVoyageContainerRequest,
  asyncHandler(voyageContainerRepository.createAndUpdateContainer),
);
router.delete(
  '',
  asyncHandler(grantPermission),
  asyncHandler(voyageContainerRepository.deleteContainer),
);
router.get('', asyncHandler(voyageContainerRepository.getAllContainer));

export default router;
