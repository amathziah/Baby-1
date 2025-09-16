export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  category: string;
  gstRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  type: 'invoice' | 'credit_note';
  originalInvoiceId?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'upi' | 'card' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
  notes?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  gstAmount: number;
  createdAt: Date;
  receiptUrl?: string;
}

export interface Reminder {
  id: string;
  invoiceId: string;
  type: 'email' | 'whatsapp' | 'sms';
  tone: 'friendly' | 'formal' | 'urgent';
  language: 'en' | 'hi' | 'mr';
  scheduledAt: Date;
  sentAt?: Date;
  status: 'scheduled' | 'sent' | 'failed';
  message: string;
}

export interface AIRule {
  id: string;
  name: string;
  description: string;
  condition: {
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
    value: any;
  }[];
  action: {
    type: 'suggest' | 'warn' | 'auto';
    message: string;
    data?: any;
  };
  priority: number;
  enabled: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  pendingPayments: number;
  overdueInvoices: number;
  lowStockItems: number;
  recentActivity: any[];
}

export type Language = 'en' | 'hi' | 'mr';

export interface Translation {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}