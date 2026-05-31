import mongoose, { Document, Schema } from 'mongoose';
import { BorrowerStatus, BREStatus, EmploymentType } from '../types';

export interface IBorrower extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  // Personal Details
  firstName: string;
  lastName: string;
  dob: Date;
  age: number;
  pan: string;
  phone: string;
  address: string;
  // Employment
  employmentType: EmploymentType;
  employerName?: string;
  salary: number;
  // Document
  salarySlipUrl?: string;
  salarySlipPublicId?: string;
  // BRE
  breStatus: BREStatus;
  breReasons: string[];
  // Status
  status: BorrowerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const borrowerSchema = new Schema<IBorrower>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    age: {
      type: Number,
      required: true,
      min: [18, 'Minimum age is 18'],
      max: [80, 'Maximum age is 80'],
    },
    pan: {
      type: String,
      required: [true, 'PAN is required'],
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED'],
      required: [true, 'Employment type is required'],
    },
    employerName: {
      type: String,
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    salarySlipUrl: String,
    salarySlipPublicId: String,
    breStatus: {
      type: String,
      enum: ['PASS', 'FAIL', 'PENDING'],
      default: 'PENDING',
    },
    breReasons: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'APPLIED'],
      default: 'REGISTERED',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full name
borrowerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const Borrower = mongoose.model<IBorrower>('Borrower', borrowerSchema);
