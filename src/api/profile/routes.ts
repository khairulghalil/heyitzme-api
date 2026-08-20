import { Router } from 'express';
import { getProfile } from './controller';

const router = Router();

router.get('/:username', getProfile);

export default router;
