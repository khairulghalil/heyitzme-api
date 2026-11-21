import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { login, changePassword } from './controller';

const router = Router();

router.post('/login', login);
router.post('/change-password', requireAuth, changePassword);

export default router;
