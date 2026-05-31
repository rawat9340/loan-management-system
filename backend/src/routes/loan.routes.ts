import { Router } from 'express';
import {
  applyForLoan,
  getLoans,
  getMyLoans,
  approveLoan,
  rejectLoan,
  disburseLoan,
  getDashboardStats,
} from '../controllers/loan.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import {
  loanApplicationValidator,
  rejectLoanValidator,
} from '../validators/loan.validator';

const router = Router();

// BORROWER: Apply
router.post(
  '/apply',
  authenticate,
  requireRole('BORROWER'),
  loanApplicationValidator,
  applyForLoan
);

// BORROWER: My loans
router.get('/my-loans', authenticate, requireRole('BORROWER'), getMyLoans);

// All ops roles: Get loans (filtered by role)
router.get(
  '/',
  authenticate,
  requireRole('ADMIN', 'SANCTION', 'DISBURSEMENT', 'COLLECTION', 'BORROWER'),
  getLoans
);

// SANCTION: Approve
router.put(
  '/:id/approve',
  authenticate,
  requireRole('SANCTION', 'ADMIN'),
  approveLoan
);

// SANCTION: Reject
router.put(
  '/:id/reject',
  authenticate,
  requireRole('SANCTION', 'ADMIN'),
  rejectLoanValidator,
  rejectLoan
);

// DISBURSEMENT: Disburse
router.put(
  '/:id/disburse',
  authenticate,
  requireRole('DISBURSEMENT', 'ADMIN'),
  disburseLoan
);

// ADMIN: Dashboard stats
router.get(
  '/admin/stats',
  authenticate,
  requireRole('ADMIN'),
  getDashboardStats
);

export default router;
