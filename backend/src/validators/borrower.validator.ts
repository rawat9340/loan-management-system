import { body } from 'express-validator';

export const borrowerProfileValidator = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required'),
  body('dob')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD'),
  body('pan')
    .trim()
    .notEmpty().withMessage('PAN is required')
    .toUpperCase()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage('Invalid PAN format. Expected: ABCDE1234F'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 10 }).withMessage('Please provide a complete address'),
  body('employmentType')
    .notEmpty().withMessage('Employment type is required')
    .isIn(['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED']).withMessage('Invalid employment type'),
  body('salary')
    .notEmpty().withMessage('Salary is required')
    .isNumeric().withMessage('Salary must be a number')
    .isFloat({ min: 0 }).withMessage('Salary cannot be negative'),
  body('employerName')
    .optional()
    .trim(),
];
