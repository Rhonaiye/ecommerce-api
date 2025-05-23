import express from 'express';
import { createProduct, updateProduct, getAllProducts, createCategory, getCategories, deleteProduct } from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/create', protect, adminOnly, upload.single('image'), createProduct);
router.post('/create-category',protect, adminOnly, createCategory)
router.delete('/delete/:id', protect, adminOnly, deleteProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.get('/', getAllProducts);
router.get('/categories', getCategories);

export default router;