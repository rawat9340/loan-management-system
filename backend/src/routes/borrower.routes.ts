import { Router } from 'express';
import multer from 'multer';
import {
  createOrUpdateProfile,
  uploadSalarySlip,
  getMyProfile,
  getRegisteredBorrowers,
  getAllBorrowers,
} from '../controllers/borrower.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { borrowerProfileValidator } from '../validators/borrower.validator';

const router = Router();

// Multer memory storage (upload to Cloudinary via stream)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and PDF files are allowed.'));
    }
  },
});

// BORROWER routes
router.post(
  '/profile',
  authenticate,
  requireRole('BORROWER'),
  borrowerProfileValidator,
  createOrUpdateProfile
);

router.post(
  '/upload-slip',
  authenticate,
  requireRole('BORROWER'),
  upload.single('salarySlip'),
  uploadSalarySlip
);

router.get('/me', authenticate, requireRole('BORROWER'), getMyProfile);

// SALES routes
router.get(
  '/list',
  authenticate,
  requireRole('SALES', 'ADMIN'),
  getRegisteredBorrowers
);

// ADMIN routes
router.get(
  '/all',
  authenticate,
  requireRole('ADMIN'),
  getAllBorrowers
);

export default router;
