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

// ⚠️ IMPORTANT: Static routes MUST come before dynamic /:id routes
// to prevent Express matching "admin" or "my-loans" as a loan ID

// ADMIN: Dashboard stats — must be before /:id routes
router.get(
  '/admin/stats',
  authenticate,
  requireRole('ADMIN'),
  getDashboardStats
);

// BORROWER: My loans — must be before /:id routes
router.get('/my-loans', authenticate, requireRole('BORROWER'), getMyLoans);

// BORROWER: Apply
router.post(
  '/apply',
  authenticate,
  requireRole('BORROWER'),
  loanApplicationValidator,
  applyForLoan
);

// All ops roles: Get loans (filtered by role)
router.get(
  '/',
  authenticate,
  requireRole('ADMIN', 'SANCTION', 'DISBURSEMENT', 'COLLECTION', 'BORROWER'),
  getLoans
);

// SANCTION: Approve — dynamic /:id routes below
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

export default router;
