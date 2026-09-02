const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAccounts() {
  console.log('Creating supermarket accounts...');

  const branch = await prisma.branch.upsert({
    where: { id: 'branch-1' },
    update: {},
    create: { id: 'branch-1', name: 'Supermarket Kenya - Main Branch', address: 'Moi Avenue, Nairobi' },
  });

  const accounts = [
    { username: 'admin', fullName: 'Joshua Kirui', role: 'super_admin', pin: '1234' },
    { username: 'manager', fullName: 'Faith Wanjiku', role: 'branch_manager', pin: '5678' },
    { username: 'cashier', fullName: 'Daniel Ochieng', role: 'cashier', pin: '1111' },
    { username: 'cashier2', fullName: 'Grace Muthoni', role: 'cashier', pin: '2222' },
    { username: 'inventory', fullName: 'Peter Kamau', role: 'inventory_clerk', pin: '3333' },
  ];

  for (const acct of accounts) {
    const role = await prisma.role.findUnique({ where: { name: acct.role } });
    const pinHash = await bcrypt.hash(acct.pin, 10);

    await prisma.user.upsert({
      where: { username: acct.username },
      update: { fullName: acct.fullName, pinHash, passwordHash: pinHash },
      create: {
        username: acct.username,
        fullName: acct.fullName,
        passwordHash: pinHash,
        pinHash,
        branchId: branch.id,
        roleId: role.id,
      },
    });
    console.log(`  Created: ${acct.username} (${acct.fullName}) - PIN: ${acct.pin}`);
  }

  // Create sample customers
  const customers = [
    { phone: '+254712345678', name: 'Jane Mwikali', email: 'jane@email.com' },
    { phone: '+254723456789', name: 'Robert Kipchoge', email: 'robert@email.com' },
    { phone: '+254734567890', name: 'Sarah Akinyi', email: null },
    { phone: '+254745678901', name: 'James Maina', email: 'james@email.com' },
    { phone: '+254756789012', name: 'Mary Njeri', email: null },
    { phone: '+254767890123', name: 'Joseph Omondi', email: null },
    { phone: '+254778901234', name: 'Anne Wambui', email: 'anne@email.com' },
    { phone: '+254789012345', name: 'Michael Otieno', email: null },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: { name: c.name, email: c.email },
      create: { phone: c.phone, name: c.name, email: c.email },
    });
  }
  console.log(`Created ${customers.length} customers`);

  console.log('\nAll accounts ready!');
  console.log('========================================');
  console.log(' ACCOUNTS');
  console.log('========================================');
  console.log(' admin     / 1234  (Super Admin)');
  console.log(' manager   / 5678  (Branch Manager)');
  console.log(' cashier   / 1111  (Cashier)');
  console.log(' cashier2  / 2222  (Cashier)');
  console.log(' inventory / 3333  (Inventory Clerk)');
  console.log('========================================');
}

createAccounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
