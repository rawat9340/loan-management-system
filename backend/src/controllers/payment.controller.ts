import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Payment } from '../models/Payment';
import { Loan } from '../models/Loan';

// COLLECTION: Record a payment
export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { loanId, amount, utr, paymentDate, note } = req.body;
  const recordedBy = req.user?.userId;

  // Check loan exists and is disbursed
  const loan = await Loan.findById(loanId);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found.' });
    return;
  }

  if (loan.status !== 'DISBURSED') {
    res.status(400).json({
      success: false,
      message: `Cannot record payment for loan with status: ${loan.status}`,
    });
    return;
  }

  // Check UTR uniqueness
  const existingPayment = await Payment.findOne({ utr: utr.toUpperCase() });
  if (existingPayment) {
    res.status(409).json({
      success: false,
      message: `UTR ${utr} has already been recorded. Each payment must have a unique UTR.`,
    });
    return;
  }

  // Check amount doesn't exceed remaining
  const remainingAmount = loan.totalRepayment - loan.totalPaid;
  if (Number(amount) > remainingAmount + 0.01) {
    res.status(400).json({
      success: false,
      message: `Payment amount ₹${amount} exceeds remaining amount ₹${remainingAmount.toFixed(2)}.`,
    });
    return;
  }

  const newCumulativePaid = loan.totalPaid + Number(amount);

  // Create payment record
  const payment = await Payment.create({
    loanId,
    borrowerId: loan.borrowerId,
    amount: Number(amount),
    utr: utr.toUpperCase(),
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    recordedBy,
    cumulativePaid: newCumulativePaid,
    note,
  });

  // Update loan totalPaid
  loan.totalPaid = newCumulativePaid;

  // Auto-close loan if fully repaid
  if (newCumulativePaid >= loan.totalRepayment - 0.01) {
    loan.status = 'CLOSED';
    loan.closedAt = new Date();
  }

  await loan.save();

  res.status(201).json({
    success: true,
    message: loan.status === 'CLOSED'
      ? '✅ Payment recorded. Loan fully repaid and CLOSED!'
      : 'Payment recorded successfully.',
    data: {
      payment,
      loan: {
        id: loan._id,
        status: loan.status,
        totalPaid: loan.totalPaid,
        totalRepayment: loan.totalRepayment,
        remainingAmount: Math.max(0, loan.totalRepayment - loan.totalPaid),
      },
    },
  });
};

// Get payments for a loan
export const getLoanPayments = async (req: Request, res: Response): Promise<void> => {
  const { loanId } = req.params;

  const loan = await Loan.findById(loanId);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found.' });
    return;
  }

  // For BORROWER, ensure it's their loan
  if (req.user?.role === 'BORROWER' && loan.userId.toString() !== req.user.userId) {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }

  const payments = await Payment.find({ loanId })
    .populate('recordedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      payments,
      summary: {
        totalPaid: loan.totalPaid,
        totalRepayment: loan.totalRepayment,
        remainingAmount: Math.max(0, loan.totalRepayment - loan.totalPaid),
        paymentCount: payments.length,
        loanStatus: loan.status,
      },
    },
  });
};
