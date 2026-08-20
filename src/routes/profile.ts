import { Router } from 'express';
import { getProfile } from '../controllers/profileController';

const router = Router();

router.get('/:username', getProfile);

export default router;
