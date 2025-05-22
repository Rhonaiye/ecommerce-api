import express from 'express';
import { createProduct, updateProduct, getAllProducts } from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/create', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.get('/', getAllProducts);

export default router;