// types/api.ts
export interface CaseResponse {
  cases: ECGUploadWithIncludes[];
}

export interface ECGUploadWithIncludes {
  id: string;
  status: Status;
  patient: Patient;
  payment: Payment;
  case?: CaseWithInterpretation;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseWithInterpretation {
  id: string;
  conclusion: string;
  riskLevel: string;
  reportUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  interpretation: {
    id: string;
    conclusion: string;
    riskLevel: string;
    reportUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
}

export type Status = 'PENDING' | 'PAID' | 'ASSIGNED' | 'IN_REVIEW' | 'COMPLETED';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export interface StatsResponse {
  totalCases: number;
  pendingCases: number;
  completedCases: number;
  totalRevenue: number;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}