import { prisma } from '@/lib/db';
import { OnboardingClient } from './OnboardingClient';

export const metadata = {
  title: 'Onboarding & Offboarding Lifecycle | SeloraX EMS',
  description: 'Automated checklist pipelines for new hires and exit clearance.',
};

export default async function OnboardingPage() {
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      photoUrl: true,
      joiningDate: true,
      department: { select: { name: true } },
      position: { select: { title: true } },
    },
    orderBy: { firstName: 'asc' },
  });

  return (
    <div className="space-y-6">
      <OnboardingClient employees={employees} />
    </div>
  );
}
