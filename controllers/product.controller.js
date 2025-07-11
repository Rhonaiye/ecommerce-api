import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { uploadFileToR2, editImageOnR2 } from '../utils/media.js';

const validateProductInput = ({ name, description, price }) => {
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.name = 'Name is required and should be at least 3 characters long.';
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.description = 'Description is required and should be at least 10 characters long.';
  }

  if (price === undefined || isNaN(price) || Number(price) <= 0) {
    errors.price = 'Price is required and must be a positive number.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const createProduct = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }

  const { name, description, price, category } = req.body;

  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  // Validate category existence
  try {
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(400).json({ message: 'Invalid category' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Invalid category ID format' });
  }

  const { isValid, errors } = validateProductInput({ name, description, price });
  if (!isValid) return res.status(400).json({ errors });

  try {
    // Upload image to R2
    const uploadResult = await uploadFileToR2(req.file.buffer, req.file.originalname);

    // Save product with image URL
    const product = await Product.create({
      name,
      description,
      price,
      image_url: uploadResult.url, // Assuming your Product model has an `imageUrl` field
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price } = req.body;

    // Validate only provided fields (partial update)
    const { isValid, errors } = validateProductInput({
      name: name ?? product.name,
      description: description ?? product.description,
      price: price ?? product.price,
    });

    if (!isValid) return res.status(400).json({ errors });

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    if (req.file?.buffer){
      const image = await editImageOnR2(product.image_url, req.file.buffer, req.file.originalname)
      product.image_url = image.url
    }

    await product.save();
    res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // Optional: Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate('category', 'name _id') // Only fetch needed fields
      .skip(skip)
      .limit(limit)
      .lean() // Return plain JS objects
      .exec();

    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      createdAt: product.createdAt,
      category: product.category ? {
        _id: product.category._id,
        name: product.category.name
      } : null,
    }));

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};


export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2 ) {
    return res.status(400).json({ error: 'Category name is required and should be at least 2 characters' });
  }

  if(!description || typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({ error: 'Category description is required and should be at least 10 characters' });
  }
  // Check if category already exists
  const existingCategory = await Category.findOne({ name: name.trim() });
  if (existingCategory) {
    return res.status(400).json({ error: 'Category already exists' });
  }
  // Create new category

  try {
    const category = await Category.create({ name: name.trim(), description: description.trim() });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};


export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};