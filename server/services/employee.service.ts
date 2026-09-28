import { employeeRepository } from '@/server/repositories/employee.repository';
import type { EmployeeCreateInput, EmployeeUpdateInput } from '@/lib/validations/employee';
import { NotFoundError } from '@/lib/api/errors';

export const employeeService = {
  async getEmployees(params?: {
    search?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return employeeRepository.findAll(params);
  },

  async getEmployeeById(id: string) {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new NotFoundError('Employee');
    return employee;
  },

  async createEmployee(data: EmployeeCreateInput) {
    return employeeRepository.create(data);
  },

  async updateEmployee(id: string, data: EmployeeUpdateInput) {
    const existing = await employeeRepository.findById(id);
    if (!existing) throw new NotFoundError('Employee');
    return employeeRepository.update(id, data);
  },

  async deleteEmployee(id: string) {
    const existing = await employeeRepository.findById(id);
    if (!existing) throw new NotFoundError('Employee');
    return employeeRepository.delete(id);
  },
};
