import express from 'express';
import { register, login, registerAdmin } from '../controllers/auth.controller.js';

const router = express.Router();
router.post('/register', register);
router.post('/admin/register', registerAdmin);
router.post('/login', login);
export default router;