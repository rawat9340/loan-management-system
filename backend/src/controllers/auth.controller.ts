import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { Borrower } from '../models/Borrower';

const generateToken = (userId: string, role: string, email: string): string => {
  const options: SignOptions = { expiresIn: 604800 }; // 7 days in seconds
  return jwt.sign(
    { userId, role, email },
    process.env.JWT_SECRET as string,
    options
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'Email already registered.' });
    return;
  }

  const user = await User.create({ name, email, password, role: 'BORROWER' });

  const token = generateToken(user._id.toString(), user.role, user.email);

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

console.log("EMAIL:", email);

const user = await User.findOne({ email }).select('+password');

console.log("USER FOUND:", !!user);

if (user) {
  console.log("STORED HASH:", user.password);
}

if (!user) {
  res.status(401).json({ success: false, message: 'Invalid email or password.' });
  return;
}

const isMatch = await user.comparePassword(password);

console.log("PASSWORD MATCH:", isMatch);

if (!isMatch) {
  res.status(401).json({ success: false, message: 'Invalid email or password.' });
  return;
}

  const token = generateToken(user._id.toString(), user.role, user.email);

  // Check if borrower profile exists
  let borrowerProfile = null;
  if (user.role === 'BORROWER') {
    borrowerProfile = await Borrower.findOne({ userId: user._id }).select('-salarySlipPublicId');
  }

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      borrowerProfile,
    },
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  let borrowerProfile = null;
  if (user.role === 'BORROWER') {
    borrowerProfile = await Borrower.findOne({ userId: user._id }).select('-salarySlipPublicId');
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      borrowerProfile,
    },
  });
};
