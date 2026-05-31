import mongoose, { Document, Schema } from 'mongoose';
import { LoanStatus } from '../types';

export interface ILoan extends Document {
  _id: mongoose.Types.ObjectId;
  borrowerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  // Loan Terms
  amount: number;
  tenure: number; // days
  interestRate: number; // fixed 12%
  simpleInterest: number;
  totalRepayment: number;
  // Status
  status: LoanStatus;
  rejectionReason?: string;
  // Audit
  appliedAt: Date;
  sanctionedAt?: Date;
  sanctionedBy?: mongoose.Types.ObjectId;
  disbursedAt?: Date;
  disbursedBy?: mongoose.Types.ObjectId;
  closedAt?: Date;
  // Payments
  totalPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'Borrower',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [50000, 'Minimum loan amount is ₹50,000'],
      max: [500000, 'Maximum loan amount is ₹5,00,000'],
    },
    tenure: {
      type: Number,
      required: [true, 'Tenure is required'],
      min: [30, 'Minimum tenure is 30 days'],
      max: [365, 'Maximum tenure is 365 days'],
    },
    interestRate: {
      type: Number,
      default: 12,
    },
    simpleInterest: {
      type: Number,
      required: true,
    },
    totalRepayment: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'REJECTED', 'SANCTIONED', 'DISBURSED', 'CLOSED'],
      default: 'APPLIED',
    },
    rejectionReason: String,
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    sanctionedAt: Date,
    sanctionedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    disbursedAt: Date,
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    closedAt: Date,
    totalPaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: remaining amount
loanSchema.virtual('remainingAmount').get(function () {
  return Math.max(0, this.totalRepayment - this.totalPaid);
});

// Indexes for performance
loanSchema.index({ status: 1 });
loanSchema.index({ borrowerId: 1 });
loanSchema.index({ userId: 1 });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
