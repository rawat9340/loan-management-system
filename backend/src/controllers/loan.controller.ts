import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Loan } from '../models/Loan';
import { Borrower } from '../models/Borrower';
import { calculateSimpleInterest } from '../services/interest.service';

// BORROWER: Apply for loan
export const applyForLoan = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const userId = req.user?.userId;
  const { amount, tenure } = req.body;

  // Check borrower profile
  const borrower = await Borrower.findOne({ userId });
  if (!borrower) {
    res.status(400).json({ success: false, message: 'Please complete your borrower profile before applying.' });
    return;
  }

  // Check BRE
  if (borrower.breStatus !== 'PASS') {
    res.status(400).json({
      success: false,
      message: 'You are not eligible for a loan based on our eligibility criteria.',
      data: { breReasons: borrower.breReasons },
    });
    return;
  }

  // Check existing active loan
  const existingLoan = await Loan.findOne({
    userId,
    status: { $in: ['APPLIED', 'SANCTIONED', 'DISBURSED'] },
  });
  if (existingLoan) {
    res.status(400).json({ success: false, message: 'You already have an active loan application.' });
    return;
  }

  // Calculate interest
  const calc = calculateSimpleInterest(Number(amount), Number(tenure));

  const loan = await Loan.create({
    borrowerId: borrower._id,
    userId,
    amount: Number(amount),
    tenure: Number(tenure),
    interestRate: calc.rate,
    simpleInterest: calc.simpleInterest,
    totalRepayment: calc.totalRepayment,
    status: 'APPLIED',
    appliedAt: new Date(),
  });

  // Update borrower status
  borrower.status = 'APPLIED';
  await borrower.save();

  res.status(201).json({
    success: true,
    message: 'Loan application submitted successfully.',
    data: { loan },
  });
};

// Get loans with role-based filtering
export const getLoans = async (req: Request, res: Response): Promise<void> => {
  const role = req.user?.role;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  let filter: Record<string, unknown> = {};

  switch (role) {
    case 'SANCTION':
      filter = { status: 'APPLIED' };
      break;
    case 'DISBURSEMENT':
      filter = { status: 'SANCTIONED' };
      break;
    case 'COLLECTION':
      filter = { status: { $in: ['DISBURSED', 'CLOSED'] } };
      break;
    case 'ADMIN':
      filter = {}; // All loans
      break;
    case 'BORROWER':
      filter = { userId: req.user?.userId };
      break;
    default:
      filter = {};
  }

  const loans = await Loan.find(filter)
    .populate({
      path: 'borrowerId',
      select: 'firstName lastName pan phone salary employmentType breStatus',
    })
    .populate('userId', 'name email')
    .populate('sanctionedBy', 'name email')
    .populate('disbursedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Loan.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      loans,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  });
};

// BORROWER: Get my loans
export const getMyLoans = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  const loans = await Loan.find({ userId })
    .populate('borrowerId', 'firstName lastName pan')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { loans } });
};

// SANCTION: Approve loan
export const approveLoan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const sanctionedBy = req.user?.userId;

  const loan = await Loan.findById(id);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found.' });
    return;
  }

  if (loan.status !== 'APPLIED') {
    res.status(400).json({ success: false, message: `Cannot approve loan with status: ${loan.status}` });
    return;
  }

  loan.status = 'SANCTIONED';
  loan.sanctionedAt = new Date();
  loan.sanctionedBy = sanctionedBy as unknown as import('mongoose').Types.ObjectId;
  await loan.save();

  res.status(200).json({
    success: true,
    message: 'Loan approved and sanctioned successfully.',
    data: { loan },
  });
};

// SANCTION: Reject loan
export const rejectLoan = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { id } = req.params;
  const { reason } = req.body;

  const loan = await Loan.findById(id);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found.' });
    return;
  }

  if (loan.status !== 'APPLIED') {
    res.status(400).json({ success: false, message: `Cannot reject loan with status: ${loan.status}` });
    return;
  }

  loan.status = 'REJECTED';
  loan.rejectionReason = reason;
  await loan.save();

  // Reset borrower status so they can apply again
  await Borrower.findByIdAndUpdate(loan.borrowerId, { status: 'REGISTERED' });

  res.status(200).json({
    success: true,
    message: 'Loan rejected.',
    data: { loan },
  });
};

// DISBURSEMENT: Disburse loan
export const disburseLoan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const disbursedBy = req.user?.userId;

  const loan = await Loan.findById(id);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found.' });
    return;
  }

  if (loan.status !== 'SANCTIONED') {
    res.status(400).json({ success: false, message: `Cannot disburse loan with status: ${loan.status}` });
    return;
  }

  loan.status = 'DISBURSED';
  loan.disbursedAt = new Date();
  loan.disbursedBy = disbursedBy as unknown as import('mongoose').Types.ObjectId;
  await loan.save();

  res.status(200).json({
    success: true,
    message: 'Loan disbursed successfully.',
    data: { loan },
  });
};

// ADMIN: Dashboard stats
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalBorrowers,
    appliedLoans,
    sanctionedLoans,
    disbursedLoans,
    closedLoans,
    rejectedLoans,
    totalDisbursedAmount,
  ] = await Promise.all([
    Borrower.countDocuments(),
    Loan.countDocuments({ status: 'APPLIED' }),
    Loan.countDocuments({ status: 'SANCTIONED' }),
    Loan.countDocuments({ status: 'DISBURSED' }),
    Loan.countDocuments({ status: 'CLOSED' }),
    Loan.countDocuments({ status: 'REJECTED' }),
    Loan.aggregate([
      { $match: { status: { $in: ['DISBURSED', 'CLOSED'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalBorrowers,
        loans: {
          applied: appliedLoans,
          sanctioned: sanctionedLoans,
          disbursed: disbursedLoans,
          closed: closedLoans,
          rejected: rejectedLoans,
          total: appliedLoans + sanctionedLoans + disbursedLoans + closedLoans + rejectedLoans,
        },
        totalDisbursedAmount: totalDisbursedAmount[0]?.total || 0,
      },
    },
  });
};
