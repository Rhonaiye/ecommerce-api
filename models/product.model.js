import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  image_url: mongoose.Schema.Types.String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  price: Number,
  createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model('Product', productSchema);