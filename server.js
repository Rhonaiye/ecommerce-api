import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';



dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())

app.use('/api/auth', authRoutes);


app.get('/app', (req, res) => {
  res.send('Welcome to the API');
});


app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection failed:', err));
