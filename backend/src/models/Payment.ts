import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  loanId: mongoose.Types.ObjectId;
  borrowerId: mongoose.Types.ObjectId;
  amount: number;
  utr: string; // Unique Transaction Reference
  paymentDate: Date;
  recordedBy: mongoose.Types.ObjectId; // Collection officer
  cumulativePaid: number; // Running total at time of this payment
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'Borrower',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be at least ₹1'],
    },
    utr: {
      type: String,
      required: [true, 'UTR is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cumulativePaid: {
      type: Number,
      required: true,
      min: [0, 'Cumulative paid cannot be negative'],
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for loan payments
paymentSchema.index({ loanId: 1, createdAt: -1 });
// Note: utr already has unique:true on the field definition above

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
