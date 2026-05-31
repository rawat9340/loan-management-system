export interface InterestCalculation {
  principal: number;
  rate: number;
  tenure: number;
  simpleInterest: number;
  totalRepayment: number;
}

const INTEREST_RATE = 12; // Fixed 12% per annum

/**
 * Calculate Simple Interest
 * SI = (P * R * T) / (365 * 100)
 * where T is in days
 */
export const calculateSimpleInterest = (
  principal: number,
  tenure: number,
  rate: number = INTEREST_RATE
): InterestCalculation => {
  const simpleInterest = (principal * rate * tenure) / (365 * 100);
  const totalRepayment = principal + simpleInterest;

  return {
    principal,
    rate,
    tenure,
    simpleInterest: Math.round(simpleInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
};
