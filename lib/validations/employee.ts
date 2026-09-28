import { z } from 'zod';

export const addressSchema = z.object({
  line1: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
});

export const employeeCreateSchema = z.object({
  employeeCode: z.string().min(2, 'Employee code is required').toUpperCase(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid work email is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  departmentId: z.string().min(1, 'Department is required'),
  positionId: z.string().min(1, 'Position is required'),
  managerId: z.string().nullable().optional(),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROBATION']).default('ACTIVE'),
  workLocation: z.string().min(1, 'Work location is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive').default(50000),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).nullable().optional(),
  headline: z.string().max(120).nullable().optional(),
  businessPhone: z.string().nullable().optional(),
});

export const employeeUpdateSchema = employeeCreateSchema.partial();

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
