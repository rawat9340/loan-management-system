'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { useLoanStore } from '@/store/loan.store';
import api from '@/lib/api';
import { calculateSI, formatCurrency } from '@/lib/utils';
import {
  personalDetailsSchema, PersonalDetailsFormData,
  employmentSchema, EmploymentFormData,
  loanDetailsSchema, LoanDetailsFormData,
} from '@/lib/validations/borrower.schema';
import {
  User, Briefcase, FileUp, CreditCard, CheckCircle,
  ChevronRight, ChevronLeft, Loader2, Upload, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Employment', icon: Briefcase },
  { id: 3, label: 'Document', icon: FileUp },
  { id: 4, label: 'Loan', icon: CreditCard },
  { id: 5, label: 'Review', icon: CheckCircle },
];

// ─── Step 1: Personal Details ─────────────────────────────────────────────────
function Step1Personal({ onNext }: { onNext: (data: PersonalDetailsFormData) => void }) {
  const { formData } = useLoanStore();

  const { register, handleSubmit, formState: { errors } } = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      pan: formData.pan,
      phone: formData.phone,
      address: formData.address,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
          <input {...register('firstName')} placeholder="John" className="input-field" />
          {errors.firstName && <p className="field-error">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
          <input {...register('lastName')} placeholder="Doe" className="input-field" />
          {errors.lastName && <p className="field-error">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Date of Birth <span className="text-gray-500 text-xs">(Age 23–50)</span>
          </label>
          <input {...register('dob')} type="date" className="input-field" />
          {errors.dob && <p className="field-error">{errors.dob.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            PAN Number <span className="text-gray-500 text-xs">(ABCDE1234F)</span>
          </label>
          <input {...register('pan')} placeholder="ABCDE1234F" className="input-field uppercase" maxLength={10} />
          {errors.pan && <p className="field-error">{errors.pan.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
        <input {...register('phone')} placeholder="9876543210" type="tel" maxLength={10} className="input-field" />
        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
        <textarea {...register('address')} rows={3} placeholder="Your complete address..." className="input-field resize-none" />
        {errors.address && <p className="field-error">{errors.address.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full">
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );
}

// ─── Step 2: Employment ───────────────────────────────────────────────────────
function Step2Employment({
  onNext,
  onBack,
}: {
  onNext: (data: EmploymentFormData) => void;
  onBack: () => void;
}) {
  const { formData } = useLoanStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EmploymentFormData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      employmentType: formData.employmentType,
      employerName: formData.employerName,
      salary: formData.salary || 25000,
    },
  });

  const empType = watch('employmentType');

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Employment Type</label>
        <div className="grid grid-cols-3 gap-3">
          {(['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED'] as const).map((type) => (
            <label
              key={type}
              className={`flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all ${
                empType === type
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <input {...register('employmentType')} type="radio" value={type} className="sr-only" />
              <Briefcase className="w-5 h-5 mb-2" />
              <span className="text-xs font-medium text-center">
                {type === 'SELF_EMPLOYED' ? 'Self Employed' : type.charAt(0) + type.slice(1).toLowerCase()}
              </span>
            </label>
          ))}
        </div>
        {errors.employmentType && <p className="field-error mt-1">{errors.employmentType.message}</p>}
      </div>

      {empType !== 'UNEMPLOYED' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Employer / Business Name</label>
          <input {...register('employerName')} placeholder="Company name" className="input-field" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Monthly Salary / Income <span className="text-gray-500 text-xs">(Min ₹25,000)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
          <input
            {...register('salary', { valueAsNumber: true })}
            type="number"
            min="0"
            placeholder="25000"
            className="input-field pl-8"
          />
        </div>
        {errors.salary && <p className="field-error">{errors.salary.message}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button type="submit" className="btn-primary flex-1">
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

// ─── Step 3: Document Upload ──────────────────────────────────────────────────
function Step3Document({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { uploadedSlipUrl, setUploadedSlipUrl, formData, updateFormData } = useLoanStore();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploading(true);

    const formDataUpload = new FormData();
    formDataUpload.append('salarySlip', selectedFile);

    try {
      const res = await api.post('/borrower/upload-slip', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedSlipUrl(res.data.data.salarySlipUrl);
      toast.success('Salary slip uploaded successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Upload failed');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleUpload(dropped);
  }, []);

  return (
    <div className="space-y-6">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700 hover:border-gray-600'
        } ${uploadedSlipUrl ? 'border-green-500 bg-green-500/5' : ''}`}
        onClick={() => document.getElementById('slip-input')?.click()}
      >
        <input
          id="slip-input"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Uploading to Cloudinary...</p>
          </div>
        ) : uploadedSlipUrl ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
            <p className="text-sm font-medium text-green-400">Salary slip uploaded!</p>
            <p className="text-xs text-gray-500 mt-1">{file?.name || 'File uploaded'}</p>
            <p className="text-xs text-blue-400 mt-2">Click to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-gray-500 mb-3" />
            <p className="text-sm font-medium text-gray-300">Drop your salary slip here</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse — JPG, PNG, PDF up to 5MB</p>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300/80">
          Please upload your most recent salary slip (last 3 months). Accepted formats: JPG, PNG, PDF. Maximum size: 5MB.
        </p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => {
            if (!uploadedSlipUrl) {
              toast.error('Please upload your salary slip before continuing');
              return;
            }
            onNext();
          }}
          className="btn-primary flex-1"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Loan Details ─────────────────────────────────────────────────────
function Step4Loan({
  onNext,
  onBack,
}: {
  onNext: (data: LoanDetailsFormData) => void;
  onBack: () => void;
}) {
  const { formData } = useLoanStore();

  const { watch, setValue, handleSubmit, formState: { errors } } = useForm<LoanDetailsFormData>({
    resolver: zodResolver(loanDetailsSchema),
    defaultValues: {
      amount: formData.amount || 100000,
      tenure: formData.tenure || 90,
    },
  });

  const amount = watch('amount') || 100000;
  const tenure = watch('tenure') || 90;
  const { si, total } = calculateSI(amount, tenure);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      {/* Amount Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">Loan Amount</label>
          <span className="text-xl font-bold gradient-text">{formatCurrency(amount)}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={500000}
          step={5000}
          value={amount}
          onChange={(e) => setValue('amount', Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1.5">
          <span>₹50,000</span>
          <span>₹5,00,000</span>
        </div>
        {errors.amount && <p className="field-error">{errors.amount.message}</p>}
      </div>

      {/* Tenure Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">Tenure</label>
          <span className="text-xl font-bold gradient-text">{tenure} days</span>
        </div>
        <input
          type="range"
          min={30}
          max={365}
          step={1}
          value={tenure}
          onChange={(e) => setValue('tenure', Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1.5">
          <span>30 days</span>
          <span>365 days</span>
        </div>
        {errors.tenure && <p className="field-error">{errors.tenure.message}</p>}
      </div>

      {/* Live Calculation */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-400" />
          Loan Summary (12% p.a. Simple Interest)
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Principal Amount</span>
            <span className="text-sm font-semibold text-white">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Interest ({tenure} days @ 12%)</span>
            <span className="text-sm font-semibold text-yellow-400">{formatCurrency(si)}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-200">Total Repayment</span>
            <span className="text-lg font-bold gradient-text">{formatCurrency(total)}</span>
          </div>
          <p className="text-xs text-gray-500">Formula: SI = (P × R × T) / (365 × 100)</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button type="submit" className="btn-primary flex-1">
          Review <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

// ─── Step 5: Review & Submit ──────────────────────────────────────────────────
function Step5Review({
  onSubmit,
  onBack,
  isSubmitting,
}: {
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const { formData } = useLoanStore();
  const { si, total } = calculateSI(formData.amount || 0, formData.tenure || 0);

  const sections = [
    {
      title: 'Personal Details',
      items: [
        { label: 'Full Name', value: `${formData.firstName} ${formData.lastName}` },
        { label: 'PAN', value: formData.pan },
        { label: 'Date of Birth', value: formData.dob },
        { label: 'Phone', value: formData.phone },
        { label: 'Address', value: formData.address },
      ],
    },
    {
      title: 'Employment',
      items: [
        { label: 'Type', value: formData.employmentType },
        { label: 'Employer', value: formData.employerName || 'N/A' },
        { label: 'Monthly Salary', value: formatCurrency(formData.salary || 0) },
      ],
    },
    {
      title: 'Loan Details',
      items: [
        { label: 'Loan Amount', value: formatCurrency(formData.amount || 0) },
        { label: 'Tenure', value: `${formData.tenure} days` },
        { label: 'Interest Rate', value: '12% p.a.' },
        { label: 'Simple Interest', value: formatCurrency(si) },
        { label: 'Total Repayment', value: formatCurrency(total) },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="glass-card rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-semibold text-blue-400 mb-3">{section.title}</h3>
          <div className="space-y-2">
            {section.items.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-white font-medium text-right max-w-xs truncate">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
        <p className="text-xs text-yellow-300/80">
          By submitting, you confirm all provided information is accurate. False information may result in loan rejection.
        </p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Apply Page ──────────────────────────────────────────────────────────
export default function ApplyPage() {
  const { user } = useRequireAuth('BORROWER');
  const { setBorrowerProfile } = useAuthStore();
  const router = useRouter();
  const { currentStep, formData, nextStep, prevStep, updateFormData, isSubmitting, setSubmitting, resetApplication } =
    useLoanStore();


  const handleStep1 = (data: PersonalDetailsFormData) => {
    // Just save to local state — don't hit the backend yet.
    // The backend profile endpoint requires employmentType too,
    // so we save personal + employment together at the end of Step 2.
    updateFormData(data);
    nextStep();
  };

  const handleStep2 = async (data: EmploymentFormData) => {
    updateFormData(data);
    // Now we have both personal + employment — send everything to the backend together
    try {
      const mergedData = { ...formData, ...data };
      const res = await api.post('/borrower/profile', mergedData);
      setBorrowerProfile(res.data.data.borrower);
      const breResult = res.data.data.breResult;
      if (breResult && !breResult.passed) {
        toast.warning(`⚠️ BRE Notice: ${breResult.reasons?.[0] || 'You may not be eligible'}`);
      } else if (breResult?.passed) {
        toast.success('✅ Eligibility check passed!');
      }
      nextStep();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Array<{ msg: string }> } } };
      const msg = error?.response?.data?.errors?.[0]?.msg || error?.response?.data?.message || 'Failed to save profile';
      toast.error(msg);
    }
  };

  const handleStep3 = () => { nextStep(); };

  const handleStep4 = (data: LoanDetailsFormData) => {
    updateFormData(data);
    nextStep();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/loans/apply', {
        amount: formData.amount,
        tenure: formData.tenure,
      });
      toast.success('🎉 Loan application submitted successfully!');
      resetApplication();
      router.push('/dashboard/borrower');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; data?: { breReasons?: string[] } } } };
      const msg = error?.response?.data?.message || 'Submission failed';
      const breReasons = error?.response?.data?.data?.breReasons;
      if (breReasons?.length) {
        toast.error(`${msg}: ${breReasons[0]}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Loan Application</h1>
          <p className="text-gray-400 mt-1">Complete all steps to apply for your loan</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone ? 'bg-blue-600 border-blue-600 text-white' :
                    isActive ? 'bg-blue-600/20 border-blue-500 text-blue-400' :
                    'bg-gray-900 border-gray-700 text-gray-500'
                  }`}>
                    {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-blue-400' : isDone ? 'text-blue-300' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-10 sm:w-16 h-0.5 mx-1 mb-5 transition-all ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/5 shadow-2xl animate-slide-in">
          <h2 className="text-lg font-semibold text-white mb-6">
            {STEPS[currentStep - 1].label}
          </h2>

          {currentStep === 1 && <Step1Personal onNext={handleStep1} />}
          {currentStep === 2 && <Step2Employment onNext={handleStep2} onBack={prevStep} />}
          {currentStep === 3 && <Step3Document onNext={handleStep3} onBack={prevStep} />}
          {currentStep === 4 && <Step4Loan onNext={handleStep4} onBack={prevStep} />}
          {currentStep === 5 && (
            <Step5Review onSubmit={handleSubmit} onBack={prevStep} isSubmitting={isSubmitting} />
          )}
        </div>
      </div>

      {/* Inline styles for form elements */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(17, 24, 39, 0.6);
          border: 1px solid rgb(55, 65, 81);
          border-radius: 0.75rem;
          color: white;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: rgb(59, 130, 246);
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        .input-field::placeholder {
          color: rgb(107, 114, 128);
        }
        .field-error {
          margin-top: 0.375rem;
          font-size: 0.875rem;
          color: rgb(248, 113, 113);
        }
        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          background: linear-gradient(to right, rgb(37, 99, 235), rgb(124, 58, 237));
          color: white;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: linear-gradient(to right, rgb(59, 130, 246), rgb(139, 92, 246));
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.25);
        }
        .btn-primary:active { transform: translateY(0); }
        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid rgb(55, 65, 81);
          color: rgb(156, 163, 175);
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
      `}</style>
    </div>
  );
}
