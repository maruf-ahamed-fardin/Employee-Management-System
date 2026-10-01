import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { AssetsClient } from './AssetsClient';

export const metadata = {
  title: 'Asset Inventory & Hardware Tracking | SeloraX EMS',
};

export default async function AssetsPage() {
  const session = await getSession();

  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      department: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { firstName: 'asc' },
  });

  return (
    <div className="space-y-6">
      <AssetsClient employees={employees} />
    </div>
  );
}
