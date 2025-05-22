import { User } from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name is required and must be at least 2 characters' });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password is required and must be at least 6 characters' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User exists' });

  const user = await User.create({ name, email, password });
  res.status(201).json({ user, token: generateToken(user) });
};

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name is required and must be at least 2 characters' });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password is required and must be at least 6 characters' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User exists' });

  const user = await User.create({ name, email, password, role: 'admin' });
  res.status(201).json({ user, token: generateToken(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ user, token: generateToken(user) });
};
