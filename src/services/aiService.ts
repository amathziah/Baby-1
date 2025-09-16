import { AIRule, Customer, Product, Invoice, Language } from '../types';
import { aiRules, cannedResponses } from '../data/aiRules';
import { dataService } from './dataService';

interface AISuggestion {
  id: string;
  type: 'suggest' | 'warn' | 'auto';
  message: string;
  data?: any;
  priority: number;
}

class AIService {
  private rules: AIRule[] = aiRules;

  evaluateRules(context: any): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    this.rules
      .filter(rule => rule.enabled)
      .forEach(rule => {
        if (this.evaluateConditions(rule.condition, context)) {
          suggestions.push({
            id: rule.id,
            type: rule.action.type,
            message: this.interpolateMessage(rule.action.message, context),
            data: rule.action.data,
            priority: rule.priority
          });
        }
      });

    return suggestions.sort((a, b) => a.priority - b.priority);
  }

  private evaluateConditions(conditions: AIRule['condition'], context: any): boolean {
    return conditions.every(condition => {
      const contextValue = this.getNestedValue(context, condition.field);
      const compareValue = condition.value === 'today' ? new Date() : 
                         condition.field.includes('minStock') ? context.minStock :
                         condition.value;

      switch (condition.operator) {
        case 'eq': return contextValue === compareValue;
        case 'gt': return contextValue > compareValue;
        case 'lt': return contextValue < compareValue;
        case 'gte': return contextValue >= compareValue;
        case 'lte': return contextValue <= compareValue;
        case 'contains': return contextValue?.toString().includes(compareValue);
        default: return false;
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private interpolateMessage(message: string, context: any): string {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return context[key] || match;
    });
  }

  // Specific AI suggestions for different contexts
  analyzeInvoice(invoice: Invoice): AISuggestion[] {
    const customer = dataService.getCustomers().find(c => c.id === invoice.customerId);
    const products = dataService.getProducts();
    
    const context = {
      ...invoice,
      customerName: customer?.name,
      totalQuantity: invoice.items.reduce((sum, item) => sum + item.quantity, 0),
      daysSinceInvoice: Math.floor((Date.now() - invoice.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      today: new Date()
    };

    return this.evaluateRules(context);
  }

  analyzeCustomer(customer: Customer): AISuggestion[] {
    const invoices = dataService.getInvoices().filter(i => i.customerId === customer.id);
    const outstandingAmount = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.total, 0);

    const context = {
      ...customer,
      outstandingAmount,
      invoiceCount: invoices.length,
      creditLimit: 100000 // Default credit limit
    };

    return this.evaluateRules(context);
  }

  analyzeProduct(product: Product): AISuggestion[] {
    const invoices = dataService.getInvoices();
    const salesData = invoices
      .flatMap(inv => inv.items)
      .filter(item => item.productId === product.id);
    
    const totalSold = salesData.reduce((sum, item) => sum + item.quantity, 0);
    const averageDailySales = totalSold / 30; // Rough estimate
    const reorderPoint = Math.ceil(averageDailySales * 7); // 1 week buffer

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
    const customer = dataService.getCustomers().find(c => c.id === invoice.customerId);
    const template = cannedResponses.payment_reminder[language][tone];
    
    return template
      .replace('{customerName}', customer?.name || 'Customer')
      .replace('{invoiceNumber}', invoice.invoiceNumber)
      .replace('{amount}', invoice.total.toString());
  }

  generateWhatsAppLink(phoneNumber: string, message: string): string {
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  getInventoryInsights(): AISuggestion[] {
    const products = dataService.getProducts();
    const allSuggestions: AISuggestion[] = [];

    products.forEach(product => {
      const suggestions = this.analyzeProduct(product);
      allSuggestions.push(...suggestions);
    });

    return allSuggestions;
  }

  getDashboardInsights(): AISuggestion[] {
    const invoices = dataService.getInvoices();
    const customers = dataService.getCustomers();
    const products = dataService.getProducts();

    const overdueInvoices = invoices.filter(inv => 
      inv.dueDate < new Date() && inv.status !== 'paid' && inv.status !== 'cancelled'
    );

    const lowStockProducts = products.filter(product => product.stock <= product.minStock);

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

    const thisMonthRevenue = invoices
      .filter(inv => inv.createdAt.getMonth() === new Date().getMonth() && inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const lastMonthRevenue = invoices
      .filter(inv => inv.createdAt.getMonth() === new Date().getMonth() - 1 && inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    if (thisMonthRevenue > lastMonthRevenue * 1.2) {
      insights.push({
        id: 'dashboard-growth',
        type: 'suggest',
        message: `Great work! Revenue is up ${((thisMonthRevenue / lastMonthRevenue - 1) * 100).toFixed(1)}% this month.`,
        data: { growth: ((thisMonthRevenue / lastMonthRevenue - 1) * 100).toFixed(1) },
        priority: 3
      });
    }

    return insights;
  }
}

export const aiService = new AIService();