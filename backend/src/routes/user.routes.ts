// backend/src/routes/user.routes.ts
import express from 'express';
import { getUserProfile } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/profile', authenticate, getUserProfile);

export default router;