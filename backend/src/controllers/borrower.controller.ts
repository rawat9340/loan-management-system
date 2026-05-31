import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';
import { Borrower } from '../models/Borrower';
import { Loan } from '../models/Loan';
import { runBRE, calculateAge } from '../services/bre.service';

export const createOrUpdateProfile = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const userId = req.user?.userId;
  const { firstName, lastName, dob, pan, phone, address, employmentType, salary, employerName } = req.body;

  const age = calculateAge(new Date(dob));
  const breResult = runBRE({ age, salary: Number(salary), employmentType, pan });

  const profileData = {
    userId,
    firstName,
    lastName,
    dob: new Date(dob),
    age,
    pan: pan.toUpperCase(),
    phone,
    address,
    employmentType,
    salary: Number(salary),
    employerName,
    breStatus: breResult.passed ? 'PASS' : 'FAIL',
    breReasons: breResult.reasons,
  };

  const borrower = await Borrower.findOneAndUpdate(
    { userId },
    profileData,
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Borrower profile saved successfully.',
    data: { borrower, breResult },
  });
};

export const uploadSalarySlip = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded.' });
    return;
  }

  const borrower = await Borrower.findOne({ userId });
  if (!borrower) {
    res.status(404).json({ success: false, message: 'Borrower profile not found. Please complete your profile first.' });
    return;
  }

  // Delete old file from cloudinary if exists
  if (borrower.salarySlipPublicId) {
    await cloudinary.uploader.destroy(borrower.salarySlipPublicId);
  }

  // Upload to Cloudinary via stream
  const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'lms/salary-slips',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result as { secure_url: string; public_id: string });
      }
    );
    streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
  });

  borrower.salarySlipUrl = uploadResult.secure_url;
  borrower.salarySlipPublicId = uploadResult.public_id;
  await borrower.save();

  res.status(200).json({
    success: true,
    message: 'Salary slip uploaded successfully.',
    data: { salarySlipUrl: uploadResult.secure_url },
  });
};

export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  const borrower = await Borrower.findOne({ userId }).select('-salarySlipPublicId');
  if (!borrower) {
    res.status(404).json({ success: false, message: 'Borrower profile not found.' });
    return;
  }

  res.status(200).json({ success: true, data: { borrower } });
};

// SALES: Get registered borrowers who have not applied
export const getRegisteredBorrowers = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const borrowers = await Borrower.find({ status: 'REGISTERED' })
    .populate('userId', 'name email createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-salarySlipPublicId');

  const total = await Borrower.countDocuments({ status: 'REGISTERED' });

  res.status(200).json({
    success: true,
    data: {
      borrowers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

// ADMIN: Get all borrowers
export const getAllBorrowers = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const borrowers = await Borrower.find()
    .populate('userId', 'name email createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-salarySlipPublicId');

  const total = await Borrower.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      borrowers,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  });
};
