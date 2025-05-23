import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  price: Number,
  image: Buffer,
  createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model('Product', productSchema);