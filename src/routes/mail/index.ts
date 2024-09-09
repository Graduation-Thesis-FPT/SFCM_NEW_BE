import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import menuController from '../../controllers/menu.controller';
import mailController from '../../controllers/mail.controller';

const router = Router();

router.post('', asyncHandler(mailController.testSendMail));
router.get('/test-pallet', asyncHandler(mailController.testPalletValid));

export default router;
