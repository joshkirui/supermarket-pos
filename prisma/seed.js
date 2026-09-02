"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const PERMISSIONS = [
    'sale.create', 'sale.view', 'sale.refund.create', 'sale.refund.approve',
    'payment.initiate', 'payment.callback.receive',
    'inventory.view', 'inventory.adjust', 'inventory.transfer',
    'product.create', 'product.update', 'product.delete', 'product.view',
    'customer.create', 'customer.update', 'customer.view',
    'report.view_sales', 'report.view_profit', 'report.view_inventory',
    'cash.session.open', 'cash.session.close', 'cash.session.view',
    'user.create', 'user.update', 'user.delete',
];
const ROLES = {
    super_admin: PERMISSIONS,
    branch_manager: [
        'sale.create', 'sale.view', 'sale.refund.create', 'sale.refund.approve',
        'payment.initiate', 'inventory.view', 'inventory.adjust', 'inventory.transfer',
        'product.create', 'product.update', 'product.view',
        'customer.create', 'customer.update', 'customer.view',
        'report.view_sales', 'report.view_profit', 'report.view_inventory',
        'cash.session.open', 'cash.session.close', 'cash.session.view',
    ],
    cashier: [
        'sale.create', 'sale.view',
        'payment.initiate',
        'product.view',
        'customer.create', 'customer.view',
        'cash.session.open', 'cash.session.view',
    ],
    inventory_clerk: [
        'inventory.view', 'inventory.adjust', 'inventory.transfer',
        'product.create', 'product.update', 'product.view',
    ],
    accountant: [
        'sale.view', 'report.view_sales', 'report.view_profit', 'report.view_inventory',
        'cash.session.view',
    ],
};
const CATEGORIES = [
    { name: 'Dairy & Eggs' },
    { name: 'Beverages' },
    { name: 'Snacks' },
    { name: 'Household' },
    { name: 'Personal Care' },
    { name: 'Bakery' },
];
const PRODUCTS = [
    { sku: 'MILK-001', name: 'Fresh Milk 500ml', category: 'Dairy & Eggs', price: 85, cost: 60, stock: 50, barcode: '6161100100011' },
    { sku: 'MILK-002', name: 'Fresh Milk 1L', category: 'Dairy & Eggs', price: 150, cost: 110, stock: 30, barcode: '6161100100028' },
    { sku: 'EGG-001', name: 'Eggs (30 pack)', category: 'Dairy & Eggs', price: 320, cost: 250, stock: 20, barcode: '6161100200011' },
    { sku: 'WATE-001', name: 'Mineral Water 500ml', category: 'Beverages', price: 50, cost: 30, stock: 100, barcode: '6161100300011' },
    { sku: 'SODA-001', name: 'Coca-Cola 500ml', category: 'Beverages', price: 80, cost: 55, stock: 80, barcode: '6161100300028' },
    { sku: 'JUIC-001', name: 'Del Monte Juice 1L', category: 'Beverages', price: 180, cost: 130, stock: 25, barcode: '6161100300035' },
    { sku: 'CHPS-001', name: 'Simba Chips 100g', category: 'Snacks', price: 120, cost: 80, stock: 60, barcode: '6161100400011' },
    { sku: 'BISC-001', name: 'Britania Cream Crackers', category: 'Snacks', price: 95, cost: 65, stock: 40, barcode: '6161100400028' },
    { sku: 'SOAP-001', name: 'Dettol Soap 100g', category: 'Personal Care', price: 130, cost: 90, stock: 35, barcode: '6161100500011' },
    { sku: 'TISS-001', name: 'Kleenex Tissues', category: 'Personal Care', price: 200, cost: 140, stock: 20, barcode: '6161100500028' },
    { sku: 'BREA-001', name: 'White Bread 400g', category: 'Bakery', price: 65, cost: 40, stock: 15, barcode: '6161100600011' },
    { sku: 'RICE-001', name: 'Pishori Rice 2kg', category: 'Household', price: 350, cost: 280, stock: 25, barcode: '6161100700011' },
];
async function main() {
    console.log('Seeding database...');
    for (const code of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { code },
            update: {},
            create: { code, description: code.replace('.', ' ').toUpperCase() },
        });
    }
    console.log(`Created ${PERMISSIONS.length} permissions`);
    for (const [roleName, rolePermissions] of Object.entries(ROLES)) {
        const role = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName, description: `${roleName.replace('_', ' ')} role` },
        });
        for (const permCode of rolePermissions) {
            const perm = await prisma.permission.findUnique({ where: { code: permCode } });
            if (perm) {
                await prisma.rolePermission.upsert({
                    where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
                    update: {},
                    create: { roleId: role.id, permissionId: perm.id },
                });
            }
        }
    }
    console.log('Created roles with permissions');
    const branch = await prisma.branch.upsert({
        where: { id: 'branch-1' },
        update: {},
        create: { id: 'branch-1', name: 'Main Branch', address: 'Nairobi, Kenya' },
    });
    await prisma.terminal.upsert({
        where: { id: 'terminal-1' },
        update: {},
        create: { id: 'terminal-1', branchId: branch.id, name: 'Till 1' },
    });
    await prisma.cashRegister.upsert({
        where: { id: 'register-1' },
        update: {},
        create: { id: 'register-1', branchId: branch.id, name: 'Register 1' },
    });
    const adminPin = await bcrypt.hash('1234', 10);
    const adminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: adminPin,
            pinHash: adminPin,
            fullName: 'System Admin',
            branchId: branch.id,
            roleId: adminRole.id,
        },
    });
    const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
    await prisma.user.upsert({
        where: { username: 'cashier1' },
        update: {},
        create: {
            username: 'cashier1',
            passwordHash: adminPin,
            pinHash: adminPin,
            fullName: 'Cashier One',
            branchId: branch.id,
            roleId: cashierRole.id,
        },
    });
    console.log('Created users');
    const categoryMap = {};
    for (const cat of CATEGORIES) {
        const created = await prisma.category.upsert({
            where: { id: cat.name.toLowerCase().replace(/\s+/g, '-') },
            update: {},
            create: { id: cat.name.toLowerCase().replace(/\s+/g, '-'), name: cat.name },
        });
        categoryMap[cat.name] = created.id;
    }
    console.log('Created categories');
    const methods = [
        { name: 'Cash', code: 'CASH', requiresRef: false },
        { name: 'M-Pesa', code: 'MPESA', requiresRef: true },
        { name: 'Card', code: 'CARD', requiresRef: true },
    ];
    for (const method of methods) {
        await prisma.paymentMethod.upsert({
            where: { code: method.code },
            update: {},
            create: {
                name: method.name,
                code: method.code,
                requiresRef: method.requiresRef,
            },
        });
    }
    console.log('Created payment methods');
    for (const prod of PRODUCTS) {
        const product = await prisma.product.upsert({
            where: { sku: prod.sku },
            update: {},
            create: {
                sku: prod.sku,
                name: prod.name,
                categoryId: categoryMap[prod.category],
                taxRate: 16,
            },
        });
        await prisma.productVariant.upsert({
            where: { barcode: prod.barcode },
            update: {},
            create: {
                productId: product.id,
                barcode: prod.barcode,
                price: prod.price,
                costPrice: prod.cost,
                stockQuantity: prod.stock,
                reorderLevel: 10,
            },
        });
    }
    console.log(`Created ${PRODUCTS.length} products with variants`);
    console.log('Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map