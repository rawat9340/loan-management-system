import { Router } from 'express';
import { recordPayment, getLoanPayments } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { paymentValidator } from '../validators/loan.validator';

const router = Router();

// COLLECTION: Record payment
router.post(
  '/',
  authenticate,
  requireRole('COLLECTION', 'ADMIN'),
  paymentValidator,
  recordPayment
);

// Get payments for a loan (multiple roles)
router.get(
  '/:loanId',
  authenticate,
  requireRole('COLLECTION', 'ADMIN', 'BORROWER', 'SANCTION', 'DISBURSEMENT'),
  getLoanPayments
);

export default router;
