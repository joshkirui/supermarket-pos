const PDFDocument = require('pdfkit');

function generateDocs() {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {
    const buffer = Buffer.concat(chunks);
    require('fs').writeFileSync('D:\\pos-backend\\POS_System_Documentation.pdf', buffer);
    console.log('Documentation PDF generated at D:\\pos-backend\\POS_System_Documentation.pdf');
  });

  // Title Page
  doc.fontSize(28).font('Helvetica-Bold').text('POS System', { align: 'center' });
  doc.fontSize(20).text('Technical Documentation', { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(12).font('Helvetica').text('Production-Grade Point of Sale System', { align: 'center' });
  doc.text('Kenyan Supermarket Edition', { align: 'center' });
  doc.moveDown(1);
  doc.text('Version 1.0', { align: 'center' });
  doc.text(new Date().toLocaleDateString(), { align: 'center' });
  doc.moveDown(3);
  doc.fontSize(10).text('Tech Stack: Node.js + NestJS + Prisma + PostgreSQL', { align: 'center' });
  doc.text('Offline Support: Electron + SQLite', { align: 'center' });
  doc.text('Payment Integration: M-Pesa STK Push', { align: 'center' });

  // Table of Contents
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('Table of Contents');
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica');
  const toc = [
    '1. System Overview',
    '2. Architecture',
    '3. Database Schema (ERD)',
    '4. API Endpoints',
    '5. Authentication & RBAC',
    '6. Payment Integration (M-Pesa)',
    '7. Offline Sync Strategy',
    '8. Receipt Generation',
    '9. Setup & Installation',
    '10. Default Credentials',
  ];
  toc.forEach((item) => doc.text(item));
  doc.moveDown(2);

  // 1. System Overview
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('1. System Overview');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('This is a production-grade Point of Sale (POS) system designed for Kenyan supermarkets. It handles sales transactions, inventory management, payment processing (M-Pesa, Cash, Card), customer loyalty, and business analytics.');
  doc.moveDown(0.5);
  doc.text('Key Features:');
  doc.text('- Transactional sales with automatic stock deduction and audit trail');
  doc.text('- M-Pesa STK Push integration with idempotent callback handling');
  doc.text('- Offline-first architecture (SQLite local + PostgreSQL cloud)');
  doc.text('- Role-based access control with granular permissions');
  doc.text('- Real-time reporting (revenue, profit, stock valuation)');
  doc.text('- PDF receipt generation');
  doc.text('- Purchase order management');
  doc.text('- Refund workflow with segregation of duties');
  doc.text('- Cash session management with reconciliation');

  // 2. Architecture
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('2. Architecture');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('The system follows a modular monolith architecture with clean module boundaries.');
  doc.moveDown(0.5);
  doc.text('Module Structure:');
  doc.moveDown(0.3);
  doc.fontSize(10);
  doc.text('src/');
  doc.text('  modules/');
  doc.text('    auth/           - Login, JWT, Guards, Permissions');
  doc.text('    products/       - Products, Variants, Categories, Brands');
  doc.text('    sales/          - Sales, Refunds, Receipts');
  doc.text('    payments/       - Payment processing, M-Pesa integration');
  doc.text('    customers/      - Customer management, Loyalty');
  doc.text('    inventory/      - Stock levels, Adjustments, Transfers');
  doc.text('    cash-management/- Cash sessions, Cash-in/out, Expenses');
  doc.text('    suppliers/      - Suppliers, Purchase Orders');
  doc.text('    reporting/      - Analytics, Reports');
  doc.text('    audit/          - Audit logging');
  doc.text('  common/');
  doc.text('    decorators/     - Custom decorators (CurrentUser, RequirePermissions)');
  doc.text('    filters/        - Global exception filter');
  doc.text('    interceptors/   - Audit interceptor');
  doc.text('    utils/          - Receipt PDF generation');

  // 3. Database Schema
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('3. Database Schema (ERD)');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('Three data layers:');
  doc.moveDown(0.3);
  doc.fontSize(10);
  doc.text('MASTER DATA:');
  doc.text('  - Branches, Users, Roles, Permissions');
  doc.text('  - Products, Variants, Categories, Brands');
  doc.text('  - Customers, Suppliers, Terminals, Cash Registers');
  doc.moveDown(0.3);
  doc.text('TRANSACTIONAL DATA:');
  doc.text('  - Sales, Sale Items');
  doc.text('  - Payments, Payment Methods');
  doc.text('  - Refunds, Refund Items');
  doc.text('  - Stock Movements');
  doc.text('  - Cash Sessions, Cash Movements');
  doc.text('  - Purchase Orders, PO Items');
  doc.text('  - Expenses');
  doc.text('  - Audit Logs');
  doc.moveDown(0.3);
  doc.text('DERIVED DATA (Views/Analytics):');
  doc.text('  - Daily Sales Summary');
  doc.text('  - Inventory Valuation');
  doc.text('  - Top Products');
  doc.text('  - Cash Reconciliation');
  doc.moveDown(0.5);
  doc.text('Key Relationships:');
  doc.text('  branches -> users, terminals, sales, cash_registers, expenses, purchase_orders');
  doc.text('  products -> variants -> sale_items, stock_movements, po_items');
  doc.text('  sales -> sale_items, payments, refunds');
  doc.text('  cash_sessions -> sales, cash_movements');

  // 4. API Endpoints
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('4. API Endpoints');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');

  const endpoints = [
    ['Method', 'Endpoint', 'Description', 'Auth'],
    ['POST', '/api/auth/login', 'Login with username + PIN', 'No'],
    ['POST', '/api/auth/refresh', 'Refresh JWT token', 'Bearer'],
    ['GET', '/api/products', 'List products (search, filter)', 'Bearer'],
    ['GET', '/api/products/scan/:barcode', 'Barcode lookup', 'Bearer'],
    ['POST', '/api/products', 'Create product', 'Bearer'],
    ['PUT', '/api/products/:id', 'Update product', 'Bearer'],
    ['POST', '/api/products/:id/variants', 'Add variant', 'Bearer'],
    ['POST', '/api/sales', 'Create sale', 'Bearer'],
    ['GET', '/api/sales', 'List sales', 'Bearer'],
    ['GET', '/api/sales/:id', 'Sale detail', 'Bearer'],
    ['GET', '/api/sales/:id/receipt', 'Generate PDF receipt', 'Bearer'],
    ['GET', '/api/sales/daily-summary', 'Daily sales summary', 'Bearer'],
    ['POST', '/api/sales/refunds', 'Create refund', 'Bearer'],
    ['GET', '/api/sales/refunds', 'List refunds', 'Bearer'],
    ['POST', '/api/sales/refunds/:id/approve', 'Approve refund', 'Bearer'],
    ['POST', '/api/sales/refunds/:id/reject', 'Reject refund', 'Bearer'],
    ['POST', '/api/payments/initiate', 'Initiate payment', 'Bearer'],
    ['POST', '/api/payments/callback/mpesa', 'M-Pesa callback', 'No'],
    ['GET', '/api/payments/:id/status', 'Check payment status', 'Bearer'],
    ['GET', '/api/inventory', 'Stock levels', 'Bearer'],
    ['GET', '/api/inventory/low-stock', 'Low stock items', 'Bearer'],
    ['GET', '/api/inventory/:variantId/movements', 'Stock movement history', 'Bearer'],
    ['POST', '/api/inventory/adjust', 'Manual stock adjustment', 'Bearer'],
    ['POST', '/api/inventory/transfer', 'Transfer between branches', 'Bearer'],
    ['POST', '/api/inventory/damage', 'Record damaged stock', 'Bearer'],
    ['GET', '/api/customers', 'List customers', 'Bearer'],
    ['GET', '/api/customers/phone/:phone', 'Find by phone', 'Bearer'],
    ['POST', '/api/customers', 'Create/upsert customer', 'Bearer'],
    ['POST', '/api/cash-sessions/open', 'Open cash session', 'Bearer'],
    ['POST', '/api/cash-sessions/:id/close', 'Close cash session', 'Bearer'],
    ['GET', '/api/cash-sessions/:id/summary', 'Session summary', 'Bearer'],
    ['POST', '/api/cash-sessions/:id/cash-in', 'Cash in', 'Bearer'],
    ['POST', '/api/cash-sessions/:id/cash-out', 'Cash out', 'Bearer'],
    ['POST', '/api/cash-sessions/:id/petty-cash', 'Petty cash', 'Bearer'],
    ['GET', '/api/suppliers', 'List suppliers', 'Bearer'],
    ['POST', '/api/suppliers', 'Create supplier', 'Bearer'],
    ['POST', '/api/purchase-orders', 'Create purchase order', 'Bearer'],
    ['GET', '/api/purchase-orders', 'List purchase orders', 'Bearer'],
    ['GET', '/api/purchase-orders/:id', 'PO detail', 'Bearer'],
    ['POST', '/api/purchase-orders/:id/receive', 'Receive stock', 'Bearer'],
    ['POST', '/api/purchase-orders/:id/cancel', 'Cancel PO', 'Bearer'],
    ['GET', '/api/reports/daily-summary', 'Daily summary report', 'Bearer'],
    ['GET', '/api/reports/top-products', 'Top products report', 'Bearer'],
    ['GET', '/api/reports/cash-reconciliation', 'Cash reconciliation', 'Bearer'],
    ['POST', '/api/expenses', 'Record expense', 'Bearer'],
    ['GET', '/api/expenses', 'List expenses', 'Bearer'],
    ['GET', '/api/expenses/summary', 'Expense summary', 'Bearer'],
  ];

  endpoints.forEach((row, i) => {
    const [method, endpoint, description, auth] = row;
    if (i === 0) {
      doc.font('Helvetica-Bold');
    } else {
      doc.font('Helvetica');
    }
    doc.text(`${method.padEnd(6)} ${endpoint.padEnd(45)} ${description.padEnd(35)} ${auth}`);
  });

  // 5. Authentication & RBAC
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('5. Authentication & RBAC');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('Authentication:');
  doc.text('- JWT-based authentication with 8-hour token expiry');
  doc.text('- Login with username + 4-digit PIN');
  doc.text('- Bearer token in Authorization header');
  doc.moveDown(0.5);
  doc.text('Roles:');
  doc.text('- super_admin: Full system access');
  doc.text('- branch_manager: Branch-scoped, reports, refunds, inventory');
  doc.text('- cashier: POS operations only');
  doc.text('- inventory_clerk: Stock management only');
  doc.text('- accountant: Reports and financial data only');
  doc.moveDown(0.5);
  doc.text('Permissions (examples):');
  doc.text('- sale.create, sale.view, sale.refund.create, sale.refund.approve');
  doc.text('- payment.initiate, payment.callback.receive');
  doc.text('- inventory.view, inventory.adjust, inventory.transfer');
  doc.text('- product.create, product.update, product.delete, product.view');
  doc.text('- customer.create, customer.update, customer.view');
  doc.text('- report.view_sales, report.view_profit, report.view_inventory');
  doc.text('- cash.session.open, cash.session.close, cash.session.view');

  // 6. Payment Integration
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('6. Payment Integration (M-Pesa)');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('Payment State Machine:');
  doc.moveDown(0.3);
  doc.fontSize(10);
  doc.text('PENDING -> PROCESSING -> SUCCESS/FAILED/TIMEOUT');
  doc.moveDown(0.5);
  doc.text('Flow:');
  doc.text('1. Cashier initiates payment with sale ID and phone number');
  doc.text('2. System creates Payment record (status: PENDING)');
  doc.text('3. STK push sent to customer phone');
  doc.text('4. Payment status updated to PROCESSING');
  doc.text('5. Customer enters PIN on phone');
  doc.text('6. Safaricom sends callback to /api/payments/callback/mpesa');
  doc.text('7. System verifies callback and updates payment status');
  doc.text('8. If successful, sale payment status updated');
  doc.moveDown(0.5);
  doc.text('Idempotency:');
  doc.text('- Every payment has a unique idempotency_key');
  doc.text('- Duplicate callbacks are detected and rejected');
  doc.text('- Receipt numbers (MpesaReceiptNumber) used as deduplication key');
  doc.moveDown(0.5);
  doc.text('Configuration (.env):');
  doc.text('- MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET');
  doc.text('- MPESA_PASSKEY, MPESA_SHORTCODE');
  doc.text('- MPESA_CALLBACK_URL');

  // 7. Offline Sync
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('7. Offline Sync Strategy');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('Architecture:');
  doc.text('- Electron app with local SQLite database');
  doc.text('- Sales work offline, queue for sync');
  doc.text('- Master data (products, prices) synced from cloud');
  doc.moveDown(0.5);
  doc.text('Sync Flow:');
  doc.text('1. POS creates sale in local SQLite');
  doc.text('2. Sale added to sync_queue table');
  doc.text('3. Background sync engine pushes queued sales');
  doc.text('4. Server assigns sale_number and validates');
  doc.text('5. Master data pulled down on reconnect');
  doc.moveDown(0.5);
  doc.text('Conflict Resolution:');
  doc.text('- Sales: Last-write-wins with server timestamp');
  doc.text('- Stock: Server is source of truth');
  doc.text('- Master Data: Server overwrites local changes');
  doc.text('- Idempotency keys prevent duplicate transactions');
  doc.moveDown(0.5);
  doc.text('Sync Queue Table (SQLite):');
  doc.text('  id, operation, table_name, record_id, payload, created_at, synced, retry_count');

  // 8. Receipt Generation
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('8. Receipt Generation');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('PDF receipts are generated using pdfkit with thermal receipt format (80mm).');
  doc.moveDown(0.5);
  doc.text('Receipt Contents:');
  doc.text('- Branch name and header');
  doc.text('- Sale number, date, time');
  doc.text('- Cashier name');
  doc.text('- Item list with quantities, prices, discounts');
  doc.text('- Subtotal, VAT (16%), Total');
  doc.text('- Payment methods and references');
  doc.text('- Loyalty points earned');
  doc.text('- Thank you message (English + Swahili)');
  doc.moveDown(0.5);
  doc.text('Endpoint: GET /api/sales/:id/receipt');
  doc.text('Returns: PDF file with Content-Disposition header');

  // 9. Setup & Installation
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('9. Setup & Installation');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('Prerequisites:');
  doc.text('- Node.js 18+');
  doc.text('- PostgreSQL 14+');
  doc.text('- npm or yarn');
  doc.moveDown(0.5);
  doc.text('Installation:');
  doc.text('1. cd D:\\pos-backend');
  doc.text('2. npm install');
  doc.text('3. Configure .env (database URL, JWT secret, M-Pesa keys)');
  doc.text('4. npx prisma migrate dev --name init');
  doc.text('5. npx prisma db seed');
  doc.text('6. npm run start:dev');
  doc.moveDown(0.5);
  doc.text('Available Scripts:');
  doc.text('- npm run start:dev    - Start in development mode');
  doc.text('- npm run build        - Build for production');
  doc.text('- npm run start:prod   - Start production server');
  doc.text('- npx prisma studio    - Open Prisma Studio');
  doc.text('- npx prisma db seed   - Seed database');
  doc.moveDown(0.5);
  doc.text('Swagger Documentation:');
  doc.text('Available at http://localhost:3000/docs');

  // 10. Default Credentials
  doc.addPage();
  doc.fontSize(20).font('Helvetica-Bold').text('10. Default Credentials');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('Admin User:');
  doc.text('  Username: admin');
  doc.text('  PIN: 1234');
  doc.moveDown(0.5);
  doc.text('Cashier User:');
  doc.text('  Username: cashier1');
  doc.text('  PIN: 1234');
  doc.moveDown(1);
  doc.fontSize(9).font('Helvetica').text('Note: Change these credentials in production!');
  doc.moveDown(2);
  doc.fontSize(8).text('--- End of Documentation ---', { align: 'center' });

  doc.end();
}

generateDocs();
