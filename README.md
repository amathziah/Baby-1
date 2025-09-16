# AI Multilingual Invoicing MVP

A comprehensive frontend-only invoicing application with AI-powered insights and multilingual support (English, Hindi, Marathi).

## Features

### Core Functionality
- **Dashboard**: Real-time analytics and AI insights
- **Invoice Management**: Create, duplicate, credit notes with GST calculations  
- **Customer Management**: Ledger tracking, tags, and credit limit monitoring
- **Payment Processing**: UPI deep-links, partial payments, and status tracking
- **Smart Reminders**: WhatsApp integration with customizable tones and languages
- **Expense Tracking**: Category-based expense management with GST handling
- **Inventory Management**: Auto-decrement, low stock alerts, and reorder suggestions
- **Financial Reports**: P&L statements and sales analytics
- **Tax Compliance**: Automated GST calculations and validation flags
- **AI Assistant**: Rule-based suggestions and contextual insights

### Technical Features
- **Frontend-Only**: No backend dependencies, all data stored locally
- **Offline-First**: Full functionality without internet connection
- **Multilingual**: Support for English, Hindi, and Marathi
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Data Export**: CSV export functionality for all data types
- **Demo Data**: Pre-populated with 25 customers, 30 products, 20 invoices

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Data Storage

All data is stored locally using browser localStorage with automatic initialization of seed data:
- 25 sample customers with realistic Indian business data
- 30 products across different categories with GST rates
- 20 invoices with various statuses and payment states
- Payment records and expense entries
- AI rules configuration for intelligent suggestions

## AI Features

The AI Assistant provides contextual insights based on:
- **Overdue Payment Detection**: Automatic identification of late payments
- **Inventory Optimization**: Low stock alerts and reorder point calculations
- **Customer Risk Assessment**: Credit limit monitoring and payment behavior analysis
- **Tax Compliance**: GST validation and calculation verification
- **Sales Analytics**: Revenue trends and product performance insights

## WhatsApp Integration

Deep-link integration for automated reminders:
- Customizable message templates in multiple languages
- Support for different tones (friendly, formal, urgent)
- Direct integration with wa.me for seamless messaging
- Bulk reminder functionality for efficient follow-ups

## Language Support

Comprehensive multilingual support:
- **English**: Default language with full feature coverage
- **Hindi**: Complete translation for Indian market
- **Marathi**: Regional language support for Maharashtra

## Demo & Testing

### Reset Demo Data
Use the "Reset Demo Data" button in settings to restore original seed data.

### Export Data
Export any data type (customers, products, invoices, etc.) to CSV format.

### UAT Script
Follow the included UAT script to validate all features systematically.

## File Structure

```
src/
├── components/           # React components
│   ├── Dashboard/       # Dashboard and analytics
│   ├── Layout/          # Navigation and layout
│   ├── AIAssistant/     # AI suggestions component
│   └── LanguageProvider.tsx
├── data/                # Seed data and AI rules
├── services/            # Data and AI services
├── types/               # TypeScript definitions
├── translations/        # Multilingual support
└── hooks/              # Custom React hooks
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is a demo MVP for educational and demonstration purposes.