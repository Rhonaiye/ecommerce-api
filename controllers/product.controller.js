import { Product } from '../models/product.model.js';

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
  console.log('hit');
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  if (!req.file) {
    console.log('Image file not received');
    return res.status(400).json({ message: 'Image is required' });
  }

  const { name, description, price } = req.body;
  const { isValid, errors } = validateProductInput({ name, description, price });

  console.log('Validation Result:', { isValid, errors });

  if (!isValid) return res.status(400).json({ errors });

  const image = req.file.buffer;

  try {
    const product = await Product.create({ name, description, price, image });
    res.status(201).json(product);
  } catch (error) {
    console.error('DB Error:', error);
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
    if (req.file?.buffer) product.image = req.file.buffer;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};
