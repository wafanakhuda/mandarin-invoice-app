'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Download, Edit3, Trash2, Save } from 'lucide-react';

// [Include all your existing interfaces here - InvoiceItem, BillTo, BillFrom, Invoice]
interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface BillTo {
  name: string;
  company: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface BillFrom {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  signatory: string;
}

interface Invoice {
  id: number | null;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  paymentMethod: string;
  billTo: BillTo;
  billFrom: BillFrom;
  items: InvoiceItem[];
  notes: string;
  tax: number;
  discount: number;
  currency: string;
}

export default function InvoiceGenerator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // All your existing state variables
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState('custom');
  const [customUnits, setCustomUnits] = useState<string[]>([
    'nos', 'no', 'pcs', 'kg', 'm', 'ft', 'sqft', 'hrs', 'boxes', 'sets', 'pairs', 'rolls'
  ]);
  const [newUnit, setNewUnit] = useState('');
  const [predefinedClients, setPredefinedClients] = useState([
    {
      name: 'Archierio Design Studio',
      company: '',
      phone: '+91 8147933468',
      address: '427, 23rd cross road, 9th Main Rd',
      city: '7th sector, HSR Layout, Bengaluru',
      state: 'Karnataka',
      pincode: '560102',
      country: 'India'
    }
  ]);

  const [currentInvoice, setCurrentInvoice] = useState<Invoice>({
    id: null,
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentMethod: 'Transfer',
    billTo: {
      name: '',
      company: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    billFrom: {
      name: 'MANDARIN DECOR PRIVATE LIMITED',
      address: '235, 2nd FL, 13th Cross Rd, Indira Nagar II Stage',
      city: 'Hoysala Nagar, Indiranagar, Bengaluru',
      state: 'Karnataka 560038',
      country: 'India',
      phone: '897-153-6537',
      signatory: 'Sibgatulla khalife'
    },
    items: [{ description: '', quantity: 1, unit: 'nos', rate: 0, amount: 0 }],
    notes: '',
    tax: 0,
    discount: 0,
    currency: '₹'
  });

  // Simple authentication check
  useEffect(() => {
    console.log('🔍 Checking authentication...');
    
    const token = localStorage.getItem('invoice-auth-token');
    console.log('Token found:', !!token);
    console.log('Token value:', token);
    
    if (!token || token !== 'invoice-authenticated-token') {
      console.log('🔒 Not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    console.log('✅ Authenticated successfully');
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  // Logout function
  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('invoice-auth-token');
    window.location.href = '/login';
  };

  // All your existing functions (copy them exactly from your working code)
  const addCustomUnit = () => {
    if (newUnit.trim() && !customUnits.includes(newUnit.trim())) {
      setCustomUnits(prev => [...prev, newUnit.trim()]);
      setNewUnit('');
    }
  };

  const removeCustomUnit = (unit: string) => {
    const defaultUnits = ['nos', 'no', 'pcs', 'kg', 'm', 'ft', 'sqft', 'hrs', 'rolls'];
    if (!defaultUnits.includes(unit)) {
      setCustomUnits(prev => prev.filter(u => u !== unit));
    }
  };

  const handleClientSelection = (value: string) => {
    setSelectedClient(value);
    if (value === 'custom') {
      setCurrentInvoice(prev => ({
        ...prev,
        billTo: {
          name: '',
          company: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        }
      }));
    } else {
      const clientIndex = parseInt(value);
      const selectedClientData = predefinedClients[clientIndex];
      if (selectedClientData) {
        setCurrentInvoice(prev => ({
          ...prev,
          billTo: { ...selectedClientData }
        }));
      }
    }
  };

  const calculateItemAmount = (quantity: number, rate: number): string => {
    return (quantity * rate).toFixed(2);
  };

  const calculateSubtotal = (): number => {
    return currentInvoice.items.reduce((sum, item) => sum + parseFloat(item.amount.toString() || '0'), 0);
  };

  const calculateTotal = (): string => {
    const subtotal = calculateSubtotal();
    const tax = (subtotal * parseFloat(currentInvoice.tax.toString() || '0')) / 100;
    const discount = parseFloat(currentInvoice.discount.toString() || '0');
    return (subtotal + tax - discount).toFixed(2);
  };

  const addItem = () => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit: 'nos', rate: 0, amount: 0 }]
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...currentInvoice.items];
    
    if (field === 'description') {
      newItems[index].description = value as string;
    } else if (field === 'unit') {
      newItems[index].unit = value as string;
    } else if (field === 'quantity') {
      newItems[index].quantity = value as number;
    } else if (field === 'rate') {
      newItems[index].rate = value as number;
    } else if (field === 'amount') {
      newItems[index].amount = value as number;
    }
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = parseFloat(calculateItemAmount(
        newItems[index].quantity,
        newItems[index].rate
      ));
    }
    
    setCurrentInvoice(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    if (currentInvoice.items.length > 1) {
      setCurrentInvoice(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const saveInvoice = () => {
    const invoiceToSave: Invoice = {
      ...currentInvoice,
      id: editingId || Date.now(),
      invoiceNumber: currentInvoice.invoiceNumber || `md${Date.now().toString().slice(-3)}`
    };

    if (selectedClient === 'custom' && 
        currentInvoice.billTo.name && 
        currentInvoice.billTo.address && 
        currentInvoice.billTo.city) {
      
      const clientExists = predefinedClients.some(client => 
        client.name === currentInvoice.billTo.name && 
        client.phone === currentInvoice.billTo.phone
      );
      
      if (!clientExists) {
        const newClient = { ...currentInvoice.billTo };
        setPredefinedClients(prev => [...prev, newClient]);
      }
    }

    if (editingId) {
      setInvoices(prev => prev.map(inv => inv.id === editingId ? invoiceToSave : inv));
      setEditingId(null);
    } else {
      setInvoices(prev => [...prev, invoiceToSave]);
    }

    resetForm();
    setShowForm(false);
  };

  const editInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setEditingId(invoice.id);
    setShowForm(true);
  };

  const deleteInvoice = (id: number) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const resetForm = () => {
    setCurrentInvoice({
      id: null,
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentMethod: 'Transfer',
      billTo: {
        name: '',
        company: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      billFrom: {
        name: 'MANDARIN DECOR PRIVATE LIMITED',
        address: '235, 2nd FL, 13th Cross Rd, Indira Nagar II Stage',
        city: 'Hoysala Nagar, Indiranagar, Bengaluru',
        state: 'Karnataka 560038',
        country: 'India',
        phone: '+91 8971536537',
        signatory: 'Sibgatulla khalife'
      },
      items: [{ description: '', quantity: 1, unit: 'nos', rate: 0, amount: 0 }],
      notes: '',
      tax: 0,
      discount: 0,
      currency: '₹'
    });
    setSelectedClient('custom');
  };

  const numberToWords = (num: number): string => {
    // [Copy your existing numberToWords function exactly]
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
    
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
    
    if (num === 0) return 'Zero';
    
    const convertHundreds = (n: number): string => {
      let result = '';
      
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      
      if (n > 0) {
        result += ones[n] + ' ';
      }
      
      return result;
    };
    
    const convertThousands = (n: number): string => {
      if (n === 0) return '';
      
      if (n < 1000) return convertHundreds(n);
      
      if (n < 100000) {
        const thousands = Math.floor(n / 1000);
        const remainder = n % 1000;
        return convertHundreds(thousands) + 'Thousand ' + convertHundreds(remainder);
      }
      
      if (n < 10000000) {
        const lakhs = Math.floor(n / 100000);
        const remainder = n % 100000;
        return convertHundreds(lakhs) + 'Lakh ' + convertThousands(remainder);
      }
      
      const crores = Math.floor(n / 10000000);
      const remainder = n % 10000000;
      return convertHundreds(crores) + 'Crore ' + convertThousands(remainder);
    };
    
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let result = convertThousands(rupees).trim();
    
    if (result) {
      result += ' Rupees';
      if (paise > 0) {
        result += ' and ' + convertThousands(paise).trim() + ' Paise';
      }
      result += ' Only';
    }
    
    return result;
  };

  const generatePDF = (invoice: Invoice) => {
    // [Copy your existing generatePDF function exactly - it's quite long]
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const subtotal = invoice.items.reduce((sum, item) => sum + parseFloat(item.amount.toString() || '0'), 0);
    const tax = (subtotal * parseFloat(invoice.tax.toString() || '0')) / 100;
    const discount = parseFloat(invoice.discount.toString() || '0');
    const total = (subtotal + tax - discount).toFixed(2);
    const amountInWords = numberToWords(parseFloat(total));

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        /* Your existing PDF styles */
        @page { margin: 0.3in; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.2; color: #333333; background: white; font-size: 11px; }
        /* Add all your existing PDF styles here */
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Your existing PDF HTML structure -->
    </div>
    <script>
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Loading and redirect screens
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Main app (copy your existing JSX structure exactly, just add logout button)
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                  setEditingId(null);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                New Invoice
              </button>
            </div>
          </div>

          {/* Copy ALL your existing JSX from here - the forms, tables, everything */}
          {/* I'm shortening this for space, but copy your complete existing JSX structure */}
          
          <div className="text-center p-8">
            <p className="text-lg text-gray-600 mb-4">✅ Authentication Working!</p>
            <p className="text-sm text-gray-500">Copy your complete invoice form JSX here</p>
            
            {/* Debug info */}
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="text-sm">
                <strong>Auth Status:</strong> Logged in as admin<br/>
                <strong>Token:</strong> {localStorage.getItem('invoice-auth-token')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
