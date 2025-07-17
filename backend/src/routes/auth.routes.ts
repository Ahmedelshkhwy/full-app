// backend/src/routes/auth.routes.ts
import express from 'express';
import { register, login, resetPasswordWithOTP } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPasswordWithOTP);

export default router;




