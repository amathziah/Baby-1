import { Customer, Product, Invoice, Payment, Expense, Reminder } from '../types';
import { seedCustomers, seedProducts, seedInvoices, seedPayments, seedExpenses } from '../data/seedData';

const STORAGE_KEYS = {
  CUSTOMERS: 'invoicing_customers',
  PRODUCTS: 'invoicing_products',
  INVOICES: 'invoicing_invoices',
  PAYMENTS: 'invoicing_payments',
  EXPENSES: 'invoicing_expenses',
  REMINDERS: 'invoicing_reminders',
  INITIALIZED: 'invoicing_initialized'
};

class DataService {
  private isInitialized(): boolean {
    return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
  }

  initializeData(): void {
    if (this.isInitialized()) return;

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(seedCustomers));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(seedProducts));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(seedInvoices));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(seedPayments));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(seedExpenses));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  resetDemoData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeData();
    window.location.reload();
  }

  // Customers
  getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data, this.dateReviver) : [];
  }

  saveCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    
    if (existingIndex >= 0) {
      customers[existingIndex] = { ...customer, updatedAt: new Date() };
    } else {
      customers.push({ ...customer, createdAt: new Date(), updatedAt: new Date() });
    }
    
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  deleteCustomer(id: string): void {
    const customers = this.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  // Products
  getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data, this.dateReviver) : [];
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = { ...product, updatedAt: new Date() };
    } else {
      products.push({ ...product, createdAt: new Date(), updatedAt: new Date() });
    }
    
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  updateProductStock(productId: string, quantity: number): void {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock = Math.max(0, product.stock - quantity);
      product.updatedAt = new Date();
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  // Invoices
  getInvoices(): Invoice[] {
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data, this.dateReviver) : [];
  }

  saveInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    const existingIndex = invoices.findIndex(i => i.id === invoice.id);
    
    if (existingIndex >= 0) {
      invoices[existingIndex] = { ...invoice, updatedAt: new Date() };
    } else {
      invoices.push({ ...invoice, createdAt: new Date(), updatedAt: new Date() });
      
      // Update product stock for new invoices
      if (invoice.type === 'invoice') {
        invoice.items.forEach(item => {
          this.updateProductStock(item.productId, item.quantity);
        });
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  deleteInvoice(id: string): void {
    const invoices = this.getInvoices().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  duplicateInvoice(invoiceId: string): Invoice {
    const invoice = this.getInvoices().find(i => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    
    const newInvoice: Invoice = {
      ...invoice,
      id: this.generateId(),
      invoiceNumber: this.generateInvoiceNumber(),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: `Duplicated from ${invoice.invoiceNumber}`
    };
    
    this.saveInvoice(newInvoice);
    return newInvoice;
  }

  // Payments
  getPayments(): Payment[] {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data, this.dateReviver) : [];
  }

  savePayment(payment: Payment): void {
    const payments = this.getPayments();
    payments.push({ ...payment, createdAt: new Date() });
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    
    // Update invoice status if fully paid
    const invoice = this.getInvoices().find(i => i.id === payment.invoiceId);
    if (invoice && payment.status === 'completed') {
      const totalPaid = this.getPayments()
        .filter(p => p.invoiceId === payment.invoiceId && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaid >= invoice.total) {
        invoice.status = 'paid';
        this.saveInvoice(invoice);
      }
    }
  }

  // Expenses
  getExpenses(): Expense[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data, this.dateReviver) : [];
  }

  saveExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    const existingIndex = expenses.findIndex(e => e.id === expense.id);
    
    if (existingIndex >= 0) {
      expenses[existingIndex] = expense;
    } else {
      expenses.push({ ...expense, createdAt: new Date() });
    }
    
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  // Reminders
  getReminders(): Reminder[] {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return data ? JSON.parse(data, this.dateReviver) : [];
  }

  saveReminder(reminder: Reminder): void {
    const reminders = this.getReminders();
    reminders.push(reminder);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }

  // Utility methods
  private dateReviver(key: string, value: any): any {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }

  generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  generateInvoiceNumber(): string {
    const invoices = this.getInvoices();
    const year = new Date().getFullYear();
    const count = invoices.filter(i => i.invoiceNumber.includes(year.toString())).length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  }

  // Export functionality
  exportToCSV(type: 'customers' | 'products' | 'invoices' | 'payments' | 'expenses'): string {
    let data: any[] = [];
    let headers: string[] = [];
    
    switch (type) {
      case 'customers':
        data = this.getCustomers();
        headers = ['Name', 'Email', 'Phone', 'Address', 'GSTIN', 'Tags', 'Created At'];
        break;
      case 'products':
        data = this.getProducts();
        headers = ['Name', 'Description', 'Price', 'Stock', 'Min Stock', 'Unit', 'Category', 'GST Rate'];
        break;
      case 'invoices':
        data = this.getInvoices();
        headers = ['Invoice Number', 'Customer', 'Subtotal', 'GST Amount', 'Total', 'Status', 'Due Date', 'Created At'];
        break;
      case 'payments':
        data = this.getPayments();
        headers = ['Invoice ID', 'Amount', 'Method', 'Status', 'Transaction ID', 'Created At'];
        break;
      case 'expenses':
        data = this.getExpenses();
        headers = ['Amount', 'Category', 'Description', 'Date', 'GST Amount'];
        break;
    }
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => this.objectToCSVRow(row, type))
    ].join('\n');
    
    return csvContent;
  }

  private objectToCSVRow(obj: any, type: string): string {
    switch (type) {
      case 'customers':
        return [
          obj.name,
          obj.email,
          obj.phone,
          obj.address,
          obj.gstin || '',
          obj.tags.join(';'),
          obj.createdAt.toLocaleDateString()
        ].map(field => `"${field}"`).join(',');
      
      case 'products':
        return [
          obj.name,
          obj.description,
          obj.price,
          obj.stock,
          obj.minStock,
          obj.unit,
          obj.category,
          obj.gstRate
        ].map(field => `"${field}"`).join(',');
      
      case 'invoices':
        const customer = this.getCustomers().find(c => c.id === obj.customerId);
        return [
          obj.invoiceNumber,
          customer?.name || '',
          obj.subtotal,
          obj.gstAmount,
          obj.total,
          obj.status,
          obj.dueDate.toLocaleDateString(),
          obj.createdAt.toLocaleDateString()
        ].map(field => `"${field}"`).join(',');
      
      case 'payments':
        return [
          obj.invoiceId,
          obj.amount,
          obj.method,
          obj.status,
          obj.transactionId || '',
          obj.createdAt.toLocaleDateString()
        ].map(field => `"${field}"`).join(',');
      
      case 'expenses':
        return [
          obj.amount,
          obj.category,
          obj.description,
          obj.date.toLocaleDateString(),
          obj.gstAmount
        ].map(field => `"${field}"`).join(',');
      
      default:
        return '';
    }
  }
}

export const dataService = new DataService();