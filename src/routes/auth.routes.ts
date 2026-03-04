import { Router } from 'express';
import { login, signup } from '../controllers/auth.controller';

const router = Router();

//signup route
router.post('/signup', signup);

//login route
router.post('/login', login);

export default router;
