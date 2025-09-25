import { AIRule, Customer, Product, Invoice, Language } from '../types';
import { aiRules, cannedResponses } from '../data/aiRules';
import { dataService } from './dataService';

// AISuggestion returned by AIService
interface AISuggestion {
  id: string;
  type: 'suggest' | 'warn' | 'auto';
  message: string;
  data?: any;
  priority: number;
}

class AIService {
  private rules: AIRule[] = aiRules;

  /**
   * Evaluate the rules against an arbitrary context object and return ordered suggestions
   */
  evaluateRules(context: any): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    this.rules
      .filter(rule => rule.enabled)
      .forEach(rule => {
        try {
          if (this.evaluateConditions(rule.condition, context)) {
            suggestions.push({
              id: rule.id,
              type: (rule.action && (rule.action.type as any)) || 'suggest',
              message: this.interpolateMessage(rule.action?.message || '', context),
              data: rule.action?.data,
              priority: rule.priority ?? 999
            });
          }
        } catch (err) {
          // If a rule evaluation fails, don't crash the whole service. Optionally log.
          // console.warn(`Error evaluating rule ${rule.id}:`, err);
        }
      });

    // sort by priority ascending (lower number = higher priority)
    return suggestions.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
  }

  /**
   * Evaluate an array of conditions. Supports basic operators and a few special token values.
   */
  private evaluateConditions(conditions: any[] = [], context: any): boolean {
    // If there are no conditions, treat as true.
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const left = this.getNestedValue(context, condition.field);
      const right = this.resolveConditionValue(condition.value, condition.field, context);

      switch (condition.operator) {
        case 'eq':
          return this.looseEquals(left, right);
        case 'gt':
          return this.compareNumeric(left, right, (a, b) => a > b);
        case 'lt':
          return this.compareNumeric(left, right, (a, b) => a < b);
        case 'gte':
          return this.compareNumeric(left, right, (a, b) => a >= b);
        case 'lte':
          return this.compareNumeric(left, right, (a, b) => a <= b);
        case 'contains':
          return (left ?? '').toString().includes((right ?? '').toString());
        case 'in':
          return Array.isArray(right) ? right.includes(left) : false;
        default:
          return false;
      }
    });
  }

  private looseEquals(a: any, b: any): boolean {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    return String(a) === String(b);
  }

  private compareNumeric(a: any, b: any, comparator: (x: number, y: number) => boolean): boolean {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isNaN(na) || Number.isNaN(nb)) return false;
    return comparator(na, nb);
  }

  private resolveConditionValue(value: any, field: string, context: any): any {
    // Special tokens
    if (value === 'today') return new Date();

    // If rule references another context field like "minStock" or "customer.creditLimit"
    if (typeof value === 'string' && value.startsWith('$')) {
      // syntax: $field.path
      return this.getNestedValue(context, value.slice(1));
    }

    // If field mentions minStock and value is omitted, try context
    if ((field || '').toLowerCase().includes('minstock') && (value === undefined || value === null)) {
      return this.getNestedValue(context, 'minStock') ?? this.getNestedValue(context, 'min_stock');
    }

    // Try to coerce numbers
    if (typeof value === 'number') return value;
    if (!isNaN(Number(value))) return Number(value);

    // Fallback: return raw value
    return value;
  }

  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((current: any, key: string) => {
      if (current === undefined || current === null) return undefined;
      // support array index like items[0]
      const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const arrayKey = arrayMatch[1];
        const idx = Number(arrayMatch[2]);
        return current[arrayKey]?.[idx];
      }
      return current[key];
    }, obj);
  }

  private interpolateMessage(message: string, context: any): string {
    if (!message) return '';

    // Replace {key} and also support nested keys {customer.name}
    return message.replace(/\{([^}]+)\}/g, (_m, keyPath) => {
      const val = this.getNestedValue(context, keyPath) ?? context[keyPath];
      if (val instanceof Date) return val.toLocaleDateString();
      if (val === undefined || val === null) return '';
      return String(val);
    });
  }

  /* ---------- Domain-specific analyzers ---------- */

  analyzeInvoice(invoice: Invoice): AISuggestion[] {
    const customer = dataService.getCustomers().find((c: Customer) => c.id === invoice.customerId);
    const products = dataService.getProducts();

    const items = invoice.items ?? [];

    const context = {
      ...invoice,
      customerName: customer?.name,
      totalQuantity: items.reduce((sum: number, item: any) => sum + (item.quantity ?? 0), 0),
      daysSinceInvoice: Math.floor((Date.now() - this.asDate(invoice.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      today: new Date(),
      items
    };

    return this.evaluateRules(context);
  }

  analyzeCustomer(customer: Customer): AISuggestion[] {
    const invoices: Invoice[] = dataService.getInvoices().filter((i: Invoice) => i.customerId === customer.id);
    const outstandingAmount = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.total ?? 0), 0);

    const context = {
      ...customer,
      outstandingAmount,
      invoiceCount: invoices.length,
      creditLimit: (customer as any).creditLimit ?? 100000 // Allow override from customer record
    };

    return this.evaluateRules(context);
  }

  analyzeProduct(product: Product): AISuggestion[] {
    const invoices: Invoice[] = dataService.getInvoices();
    const salesData = invoices
      .flatMap(inv => (inv.items ?? []).map(item => ({ ...item, invoiceDate: inv.createdAt })))
      .filter((item: any) => item.productId === product.id);

    const totalSold = salesData.reduce((sum: number, item: any) => sum + (item.quantity ?? 0), 0);

    // Estimate average daily sales using last 30 days if available
    const last30Days = 30;
    const averageDailySales = last30Days > 0 ? totalSold / last30Days : 0;
    const reorderPoint = Math.ceil(averageDailySales * 7); // one-week buffer

    const context = {
      ...product,
      totalSold,
      averageDailySales,
      reorderPoint,
      month: new Date().getMonth()
    };

    return this.evaluateRules(context);
  }

  generatePaymentReminder(invoice: Invoice, tone: 'friendly' | 'formal' | 'urgent', language: Language): string {
    const customer = dataService.getCustomers().find((c: Customer) => c.id === invoice.customerId);
    const lang = language || ('en' as Language);

    // Safe access chain for templates. If cannedResponses missing, fallback to a simple template.
    const template = (((cannedResponses || {}) as any).payment_reminder?.[lang]?.[tone])
      ?? `{customerName},\nThis is a reminder that invoice {invoiceNumber} for {amount} is due.`;

    return template
      .replace('{customerName}', customer?.name || 'Customer')
      .replace('{invoiceNumber}', invoice.invoiceNumber ?? '')
      .replace('{amount}', (invoice.total ?? 0).toString());
  }

  generateWhatsAppLink(phoneNumber: string, message: string): string {
    if (!phoneNumber) return '';
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message || '');
    // If phone doesn't contain country code, caller should provide full number including country code.
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  getInventoryInsights(): AISuggestion[] {
    const products = dataService.getProducts();
    const allSuggestions: AISuggestion[] = [];

    products.forEach((product: Product) => {
      const suggestions = this.analyzeProduct(product);
      allSuggestions.push(...suggestions);
    });

    return allSuggestions;
  }

  getDashboardInsights(): AISuggestion[] {
    const invoices: Invoice[] = dataService.getInvoices();
    const customers: Customer[] = dataService.getCustomers();
    const products: Product[] = dataService.getProducts();

    const now = new Date();

    const overdueInvoices = invoices.filter(inv => {
      const due = this.asDate(inv.dueDate);
      return due && due < now && inv.status !== 'paid' && inv.status !== 'cancelled';
    });

    const lowStockProducts = products.filter(product => (product.stock ?? 0) <= (product.minStock ?? 0));

    const insights: AISuggestion[] = [];

    if (overdueInvoices.length > 0) {
      insights.push({
        id: 'dashboard-overdue',
        type: 'warn',
        message: `You have ${overdueInvoices.length} overdue invoices requiring attention.`,
        data: { count: overdueInvoices.length },
        priority: 1
      });
    }

    if (lowStockProducts.length > 0) {
      insights.push({
        id: 'dashboard-low-stock',
        type: 'warn',
        message: `${lowStockProducts.length} products are running low on stock.`,
        data: { count: lowStockProducts.length },
        priority: 2
      });
    }

    const thisMonth = now.getMonth();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth();

    const thisMonthRevenue = invoices
      .filter(inv => this.asDate(inv.createdAt).getMonth() === thisMonth && inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total ?? 0), 0);

    const lastMonthRevenue = invoices
      .filter(inv => this.asDate(inv.createdAt).getMonth() === lastMonth && inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total ?? 0), 0);

    if (lastMonthRevenue > 0 && thisMonthRevenue > lastMonthRevenue * 1.2) {
      const growth = ((thisMonthRevenue / lastMonthRevenue - 1) * 100).toFixed(1);
      insights.push({
        id: 'dashboard-growth',
        type: 'suggest',
        message: `Great work! Revenue is up ${growth}% this month.`,
        data: { growth },
        priority: 3
      });
    }

    return insights;
  }

  /* ---------- Utilities ---------- */
  private asDate(val: any): Date {
    if (!val) return new Date(0);
    if (val instanceof Date) return val;
    // Accept ISO strings or timestamps
    if (typeof val === 'number') return new Date(val);
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed;
    return new Date(0);
  }
}

export const aiService = new AIService();
export default aiService;
