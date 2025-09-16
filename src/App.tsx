import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageProvider';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { dataService } from './services/dataService';
import { Invoices } from './pages/Invoices';
import { Customers } from './pages/Customers';
import { Payments } from './pages/Payments';
import { Reminders } from './pages/Reminders';
import { Expenses } from './pages/Expenses';
import { Inventory } from './pages/Inventory';
import { Reports } from './pages/Reports';
import { Compliance } from './pages/Compliance';



function App() {
  useEffect(() => {
    dataService.initializeData();
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="customers" element={<Customers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="compliance" element={<Compliance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;