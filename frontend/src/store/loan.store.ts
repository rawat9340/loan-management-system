import { create } from 'zustand';
import { LoanFormData } from '@/types';

type Step = 1 | 2 | 3 | 4 | 5;

interface LoanApplicationState {
  currentStep: Step;
  formData: Partial<LoanFormData>;
  isSubmitting: boolean;
  uploadedSlipUrl: string | null;
}

interface LoanApplicationActions {
  setStep: (step: Step) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<LoanFormData>) => void;
  setUploadedSlipUrl: (url: string | null) => void;
  setSubmitting: (submitting: boolean) => void;
  resetApplication: () => void;
}

type LoanStore = LoanApplicationState & LoanApplicationActions;

const initialFormData: Partial<LoanFormData> = {
  amount: 100000,
  tenure: 90,
};

export const useLoanStore = create<LoanStore>((set) => ({
  // State
  currentStep: 1,
  formData: initialFormData,
  isSubmitting: false,
  uploadedSlipUrl: null,

  // Actions
  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(5, state.currentStep + 1) as Step,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1) as Step,
    })),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setUploadedSlipUrl: (url) => set({ uploadedSlipUrl: url }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  resetApplication: () =>
    set({
      currentStep: 1,
      formData: initialFormData,
      isSubmitting: false,
      uploadedSlipUrl: null,
    }),
}));
