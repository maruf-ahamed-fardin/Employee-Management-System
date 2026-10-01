import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding company hardware & inventory assets...');

  const employees = await prisma.employee.findMany();
  const empMap = new Map(employees.map((e) => [e.employeeCode, e.id]));

  // Clear previous sample assets if any
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM Asset`);
  } catch (err) {
    console.log('Asset table is clean.');
  }

  const sampleAssets = [
    {
      id: randomUUID(),
      assetTag: 'AST-LPT-001',
      name: 'MacBook Pro 16" M2 Max',
      category: 'LAPTOP',
      model: 'Apple Silicon M2 Max (32GB / 1TB SSD)',
      serialNumber: 'C02G9988MD6T',
      purchaseDate: '2024-01-15',
      purchaseCost: 385000,
      condition: 'GOOD',
      status: 'ASSIGNED',
      employeeCode: 'SX-001', // Maruf Ahamed
      location: 'Dhaka HQ - Engineering Bay',
      notes: 'Primary workstation assigned to Tech Lead. Includes MagSafe charger and sleeve.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-MON-001',
      name: 'Dell UltraSharp 27" 4K USB-C Hub',
      category: 'MONITOR',
      model: 'Dell U2723QE IPS Black',
      serialNumber: 'CN-0K791X-74261',
      purchaseDate: '2024-02-10',
      purchaseCost: 78000,
      condition: 'GOOD',
      status: 'ASSIGNED',
      employeeCode: 'SX-001', // Maruf Ahamed
      location: 'Dhaka HQ - Desk 04',
      notes: '90W Power Delivery monitor connected to Tech Lead workstation.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-LPT-002',
      name: 'Dell XPS 15 9530',
      category: 'LAPTOP',
      model: 'Intel Core i9-13900H / 32GB / RTX 4070',
      serialNumber: '5CD31289Z9',
      purchaseDate: '2024-02-20',
      purchaseCost: 265000,
      condition: 'GOOD',
      status: 'ASSIGNED',
      employeeCode: 'SX-002', // S. M. Farhan
      location: 'Dhaka HQ - Backend Desk',
      notes: 'Assigned for high-performance microservices and database clustering.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-LPT-003',
      name: 'ThinkPad X1 Carbon Gen 11',
      category: 'LAPTOP',
      model: 'Intel Core i7-1365U / 16GB / 512GB SSD',
      serialNumber: 'PF3X88910Q',
      purchaseDate: '2024-03-01',
      purchaseCost: 220000,
      condition: 'NEW',
      status: 'ASSIGNED',
      employeeCode: 'SX-005', // Nusrat Jahan (Designer)
      location: 'Dhaka HQ - Design Studio',
      notes: 'Assigned for Figma UI/UX, product prototyping, and design ops.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-MON-002',
      name: 'LG 34" Curved UltraWide 4K',
      category: 'MONITOR',
      model: 'LG 34WN80C-B IPS HDR10',
      serialNumber: 'LG34-99812-BD',
      purchaseDate: '2024-03-05',
      purchaseCost: 82000,
      condition: 'GOOD',
      status: 'ASSIGNED',
      employeeCode: 'SX-005', // Nusrat Jahan
      location: 'Dhaka HQ - Design Studio',
      notes: 'UltraWide display used for multi-screen UI wireframing and design review.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-LPT-004',
      name: 'MacBook Air 15" M2',
      category: 'LAPTOP',
      model: 'Apple M2 16GB Unified / 512GB SSD',
      serialNumber: 'C02J4581MNP1',
      purchaseDate: '2024-04-12',
      purchaseCost: 175000,
      condition: 'GOOD',
      status: 'ASSIGNED',
      employeeCode: 'SX-003', // HR / Operations
      location: 'Dhaka HQ - Operations Suite',
      notes: 'Assigned for HRIS portal management, payroll records, and candidate interviews.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-MOB-001',
      name: 'Apple iPhone 15 Pro (Testing Device)',
      category: 'MOBILE',
      model: 'A3102 256GB Natural Titanium',
      serialNumber: 'DN6W4892P81',
      purchaseDate: '2024-05-18',
      purchaseCost: 155000,
      condition: 'GOOD',
      status: 'ASSIGNED',
      employeeCode: 'SX-004', // QA / Testing
      location: 'Dhaka HQ - Mobile QA Lab',
      notes: 'Dedicated mobile QA testing device for iOS release verification.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-LPT-005',
      name: 'ASUS ROG Zephyrus G14',
      category: 'LAPTOP',
      model: 'AMD Ryzen 9 7940HS / 16GB / RTX 4060',
      serialNumber: 'G14-99214-ROG',
      purchaseDate: '2024-06-01',
      purchaseCost: 195000,
      condition: 'NEW',
      status: 'AVAILABLE',
      employeeCode: null,
      location: 'Dhaka HQ - IT Storage Locker B2',
      notes: 'Freshly formatted, sanitized, and pre-loaded with corporate Docker/Dev stack.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-MON-003',
      name: 'BenQ PD2705U 27" 4K Designer Monitor',
      category: 'MONITOR',
      model: 'BenQ PD2705U Calman Verified',
      serialNumber: 'BQ27-88123-UX',
      purchaseDate: '2024-06-15',
      purchaseCost: 72000,
      condition: 'NEW',
      status: 'AVAILABLE',
      employeeCode: null,
      location: 'Dhaka HQ - IT Storage Shelf 1',
      notes: 'Spare 4K color-accurate monitor ready for next design or developer hire.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-ACC-001',
      name: 'Keychron Q1 Pro Mechanical Keyboard',
      category: 'PERIPHERAL',
      model: 'Keychron Q1 Pro Wireless QMK/VIA (Gateron Red)',
      serialNumber: 'KQ1-22910-PRO',
      purchaseDate: '2024-04-02',
      purchaseCost: 22000,
      condition: 'FAIR',
      status: 'MAINTENANCE',
      employeeCode: null,
      location: 'Dhaka HQ - IT Repair Lab',
      notes: 'Spacebar stabilizer loose; undergoing switch servicing and firmware update.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-FUR-001',
      name: 'Herman Miller Aeron Ergonomic Chair',
      category: 'FURNITURE',
      model: 'Size B Fully Adjustable Mineral Frame',
      serialNumber: 'HM-AER-2024-81',
      purchaseDate: '2024-01-10',
      purchaseCost: 140000,
      condition: 'GOOD',
      status: 'ASSIGNED',
      employeeCode: 'SX-001', // Maruf Ahamed
      location: 'Dhaka HQ - Executive Desk 01',
      notes: 'Ergonomic lumbar support chair for leadership workstation.',
    },
    {
      id: randomUUID(),
      assetTag: 'AST-LPT-006',
      name: 'MacBook Pro 15" (Late 2018 Legacy)',
      category: 'LAPTOP',
      model: 'Intel Core i7 2.6GHz / 16GB / 512GB',
      serialNumber: 'C02W9912HG7',
      purchaseDate: '2019-05-10',
      purchaseCost: 190000,
      condition: 'DAMAGED',
      status: 'RETIRED',
      employeeCode: null,
      location: 'Dhaka HQ - E-Waste Storage',
      notes: 'Battery swelling detected; decommissioned and marked for certified e-recycling.',
    },
  ];

  for (const item of sampleAssets) {
    const employeeId = item.employeeCode ? empMap.get(item.employeeCode) || null : null;
    const assignedAt = employeeId ? "datetime('now', '-30 days')" : 'NULL';

    await prisma.$executeRawUnsafe(
      `INSERT INTO Asset (
        id, assetTag, name, category, model, serialNumber, purchaseDate,
        purchaseCost, currency, condition, status, assignedToId, assignedAt,
        location, notes, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, 'BDT', ?, ?, ?, ${assignedAt},
        ?, ?, datetime('now'), datetime('now')
      )`,
      item.id,
      item.assetTag,
      item.name,
      item.category,
      item.model,
      item.serialNumber,
      item.purchaseDate,
      item.purchaseCost,
      item.condition,
      item.status,
      employeeId,
      item.location,
      item.notes
    );
  }

  console.log(`Successfully seeded ${sampleAssets.length} enterprise assets!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
