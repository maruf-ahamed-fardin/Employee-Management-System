export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'PROBATION';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Address {
  line1: string;
  city: string;
  postcode?: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface SocialLink {
  kind: 'GITHUB' | 'LINKEDIN' | 'FACEBOOK' | 'INSTAGRAM' | 'DISCORD' | 'WEBSITE';
  url: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender?: Gender | null;
  address: Address;
  emergencyContact: EmergencyContact;
  photoUrl?: string | null;
  bloodGroup?: BloodGroup | null;
  departmentId: string;
  departmentName?: string;
  positionId: string;
  positionTitle?: string;
  managerId?: string | null;
  managerName?: string | null;
  joiningDate: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  workLocation: string;
  salary: number;
  headline?: string | null;
  businessPhone?: string | null;
  socialLinks?: SocialLink[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSummary {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  joiningDate: string;
  workLocation: string;
  photoUrl?: string | null;
  initials: string;
}
