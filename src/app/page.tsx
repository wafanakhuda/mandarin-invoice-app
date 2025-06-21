'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Download, Edit3, Trash2, Save } from 'lucide-react';

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customUnits, setCustomUnits] = useState<string[]>([
    'nos', 'no', 'pcs', 'kg', 'm', 'ft', 'sqft', 'hrs', 'boxes', 'sets', 'pairs', 'rolls'
  ]);
  const [newUnit, setNewUnit] = useState('');
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
  const [showForm, setShowForm] = useState(false);
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

  const [selectedClient, setSelectedClient] = useState('custom');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load data from memory-based storage on component mount
  useEffect(() => {
    // Since localStorage is not available, we'll use in-memory storage
    // Data will persist only during the session
  }, []);

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

  // Add the missing handleClientSelection function
  const handleClientSelection = (value: string) => {
    setSelectedClient(value);
    
    if (value === 'custom') {
      // Reset to empty client details for custom entry
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
      // Load selected predefined client
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
  
  // Type-safe field updates
  if (field === 'description') {
    newItems[index].description = value as string;           // ✅ Direct assignment
  } else if (field === 'unit') {
    newItems[index].unit = value as string;                  // ✅ Direct assignment
  } else if (field === 'quantity') {
    newItems[index].quantity = value as number;              // ✅ Direct assignment
  } else if (field === 'rate') {
    newItems[index].rate = value as number;                  // ✅ Direct assignment
  } else if (field === 'amount') {
    newItems[index].amount = value as number;                // ✅ Direct assignment
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

    // Save new client to predefined clients if it's custom and has complete info
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
        @page {
            margin: 0.3in;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.2;
            color: #333333;
            background: white;
            font-size: 11px;
        }
        
        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 15px;
            background: white;
            min-height: 297mm;
        }
        
        /* Improved Header Section */
        .header {
            padding: 10px 0 45px 0;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            min-height: 140px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            height: 90px;
        }
        
        .company-info {
            flex: 1;
            max-width: 400px;
        }

        .company-info h4 {
            font-size: 20px;
            font-weight: bold;
            color: #222;
            margin-bottom: 6px;
            line-height: 1.2;
        }
        
        .trademark {
            font-size: 14px;
            vertical-align: super;
            margin-left: 2px;
        }
        
        .company-tagline {
            font-size: 14px;
            font-style: italic;
            color: #555;
            margin-bottom: 8px;
            line-height: 1.3;
        }
        
        .company-address {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }
        
    
        
        .logo-and-title {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            flex-shrink: 0;
            margin-top: -10px;
        }
        
        .logo-section {
            text-align: center;
        }
        
        .logo-image {
            width: 200px;
            height: 60px;
            object-fit: cover;
            object-position: center;
            border-radius: 8px;
        }
        
        .logo-fallback {
            width: 200px;
            height: 60px;
            background: #333;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            border-radius: 8px;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-title h2 {
            font-size: 20px;
            color: #8B1538;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 0;
            text-transform: uppercase;
            line-height: 1;
        }
        
        /* Compressed Bill To and Invoice Details */
        .invoice-info {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
        }
        
        .bill-to {
            flex: 1;
            margin-right: 30px;
        }
        
        .bill-to h3 {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .bill-to p {
            font-size: 13px;
            margin: 3px 0;
            color: #333;
            line-height: 1.3;
        }
        
        .invoice-details {
            text-align: right;
            flex: 1;
        }
        
        .invoice-details p {
            font-size: 13px;
            margin: 3px 0;
            color: #333;
            line-height: 1.3;
        }
        
        .invoice-details strong {
            font-weight: 600;
        }
        
        /* Compressed Burgundy Header Bar */
        .invoice-header-bar {
            background: #8B1538;
            color: white;
            padding: 12px 15px;
            margin: 15px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 0;
        }
        
        .header-item {
            text-align: center;
            flex: 1;
        }
        
        .header-item h4 {
            font-size: 12px;
            margin-bottom: 4px;
            opacity: 0.9;
            font-weight: normal;
        }
        
        .header-item p {
            font-size: 14px;
            font-weight: bold;
        }
        
        .total-due {
            text-align: right;
            flex: 1;
        }
        
        .total-due h4 {
            font-size: 12px;
            margin-bottom: 4px;
            opacity: 0.9;
            font-weight: normal;
        }
        
        .total-due p {
            font-size: 16px;
            font-weight: bold;
        }
        
        /* Items Table with Better Font Sizes */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #333;
            background: white;
        }
        
        .items-table th {
            background: #333;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-size: 14px;
            font-weight: bold;
            border-right: 1px solid #555;
        }
        
        .items-table th:last-child {
            border-right: none;
        }
        
        .items-table th.amount-col {
            text-align: right;
        }
        
        .items-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #ddd;
            border-right: 1px solid #ddd;
            font-size: 13px;
            vertical-align: top;
            line-height: 1.4;
        }
        
        .items-table td:last-child {
            border-right: none;
        }
        
        .amount-col {
            text-align: right;
            font-weight: normal;
        }
        
        .total-row {
            background: #f8f9fa;
            font-weight: bold;
        }
        
        .total-row td {
            padding: 14px 8px;
            font-size: 15px;
            border-bottom: 2px solid #333;
        }
        
        .tax-row td {
            padding: 10px 8px;
            font-size: 13px;
            background: #f5f5f5;
        }
        
        /* Better spacing sections with larger fonts */
        .amount-words {
            margin: 15px 0;
            padding: 12px;
            background: #f0f8ff;
            border: 1px solid #8B1538;
            border-radius: 4px;
            font-size: 13px;
        }
        
        .amount-words strong {
            color: #8B1538;
            font-size: 14px;
        }
        
        /* Notes Section */
        .notes-section {
            margin: 20px 0;
            padding: 12px;
            background: #f8f9fa;
            border-left: 3px solid #8B1538;
        }
        
        .notes-title {
            font-weight: bold;
            font-size: 14px;
            color: #8B1538;
            margin-bottom: 6px;
        }
        
        .notes-content {
            font-size: 13px;
            color: #333;
            line-height: 1.4;
        }
        
        /* Footer with better spacing */
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        
        .footer-company {
            flex: 1;
            font-size: 12px;
            color: #666;
            line-height: 1.4;
            max-width: 200px;
        }
        
        .footer-company strong {
            color: #333;
            font-size: 13px;
        }
        
        .signature-section {
            text-align: center;
            flex: 1;
        }
        
        .signature-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 15px;
        }
        
        .signatory-name {
            font-size: 13px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 6px;
            display: inline-block;
            min-width: 150px;
            color: #333;
        }
        
        /* Payment Details */
        .payment-details {
            margin-top: 25px;
            padding: 20px;
            border: 2px solid #8B1538;
            border-radius: 6px;
            background: #f9f9f9;
            text-align: center;
        }
        
        .payment-title {
            font-size: 15px;
            font-weight: bold;
            color: #8B1538;
            margin-bottom: 8px;
        }
        
        .payment-info {
            font-size: 13px;
            margin: 4px 0;
            color: #333;
        }
        
        .payment-value {
            font-weight: bold;
            color: #8B1538;
        }
        
        .payment-note {
            font-size: 11px;
            color: #666;
            margin-top: 6px;
            font-style: italic;
        }
        
        .footer-company {
            flex: 1;
            font-size: 9px;
            color: #666;
            line-height: 1.3;
            max-width: 200px;
        }
        
        .footer-company strong {
            color: #333;
            font-size: 10px;
        }
        
        .signature-section {
            text-align: center;
            flex: 1;
        }
        
        .signature-label {
            font-size: 10px;
            color: #666;
            margin-bottom: 15px;
        }
        
        .seal-container {
            margin-bottom: 10px;
            display: flex;
            justify-content: center;
        }
        
        .seal-image {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }
        
        .seal-fallback {
            width: 80px;
            height: 80px;
            border: 2px solid #333;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            background: white;
        }
        
        .seal-text-top {
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
            text-transform: uppercase;
        }
        
        .seal-logo {
            font-size: 16px;
            font-weight: bold;
            margin: 2px 0;
        }
        
        .seal-text-bottom {
            font-size: 7px;
            font-weight: bold;
        }
        
        .seal-stars {
            position: absolute;
            font-size: 8px;
        }
        
        .seal-star-left {
            left: 10px;
            bottom: 15px;
        }
        
        .seal-star-right {
            right: 10px;
            bottom: 15px;
        }
        
        .seal-phone {
            position: absolute;
            bottom: 5px;
            font-size: 6px;
            font-weight: bold;
        }
        
        .signatory-name {
            font-size: 11px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 6px;
            display: inline-block;
            min-width: 150px;
            color: #333;
        }
        
        /* Compressed Payment Details */
        .payment-details {
            margin-top: 20px;
            padding: 12px;
            border: 2px solid #8B1538;
            border-radius: 6px;
            background: #f9f9f9;
            text-align: center;
        }
        
        .payment-title {
            font-size: 13px;
            font-weight: bold;
            color: #8B1538;
            margin-bottom: 8px;
        }
        
        .payment-info {
            font-size: 11px;
            margin: 4px 0;
            color: #333;
        }
        
        .payment-value {
            font-weight: bold;
            color: #8B1538;
        }
        
        .payment-note {
            font-size: 9px;
            color: #666;
            margin-top: 6px;
            font-style: italic;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
                font-size: 10px;
            }
            
            .invoice-container {
                max-width: none;
                padding: 10px;
                margin: 0;
            }
            
            .payment-details {
                page-break-inside: avoid;
                margin-top: 15px;
            }
            
            .footer {
                page-break-inside: avoid;
            }
            
            .invoice-header-bar {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .items-table th {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header Section -->
        <div class="header">
            <div class="header-content">
                <div class="company-info">
                    <h1>${invoice.billFrom.name}<span class="trademark">™</span></h1>
                    <div class="company-tagline">Interiors that Reflects You</div>
                    <div class="company-address">
                        ${invoice.billFrom.address}, ${invoice.billFrom.city}, ${invoice.billFrom.state}<br>
                        ${invoice.billFrom.country} | Phone: ${invoice.billFrom.phone}
                    </div>
                </div>
                <div class="logo-and-title">
                    <div class="logo-section">
                        <img src="/assets/logo.PNG" alt="Company Logo" class="logo-image" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="logo-fallback" style="display: none;">MS</div>
                    </div>
                    <div class="invoice-title">
                        <h1>INVOICE</h1>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bill To and Invoice Details -->
        <div class="invoice-info">
            <div class="bill-to">
                <h3>BILL TO</h3>
                <p><strong>${invoice.billTo.name}</strong></p>
                ${invoice.billTo.company && invoice.billTo.company !== invoice.billTo.name ? `<p><strong>${invoice.billTo.company}</strong></p>` : ''}
                <p>${invoice.billTo.address}</p>
                <p>${invoice.billTo.city}, ${invoice.billTo.state} ${invoice.billTo.pincode}</p>
                <p>${invoice.billTo.country} | Phone: ${invoice.billTo.phone}</p>
            </div>
        </div>

        <!-- Burgundy Header Bar -->
        <div class="invoice-header-bar">
            <div class="header-item">
                <h4>Invoice No.:</h4>
                <p>${invoice.invoiceNumber}</p>
            </div>
            <div class="header-item">
                <h4>Issue date:</h4>
                <p>${new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div class="header-item">
                <h4>Due date:</h4>
                <p>${new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div class="total-due">
                <h4>Total due</h4>
                <p>${invoice.currency} ${parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 40%;">Description</th>
                    <th style="width: 20%;">Quantity</th>
                    <th style="width: 20%;">Unit price (${invoice.currency})</th>
                    <th style="width: 20%;" class="amount-col">Amount (${invoice.currency})</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity} ${item.unit}</td>
                        <td class="amount-col">${parseFloat(item.rate.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td class="amount-col">${parseFloat(item.amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                `).join('')}
                ${invoice.tax > 0 ? `
                    <tr class="tax-row">
                        <td colspan="3" style="text-align: right; padding-right: 15px;"><strong>Tax (${invoice.tax}%):</strong></td>
                        <td class="amount-col"><strong>${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    </tr>
                ` : ''}
                ${invoice.discount > 0 ? `
                    <tr class="tax-row">
                        <td colspan="3" style="text-align: right; padding-right: 15px;"><strong>Discount:</strong></td>
                        <td class="amount-col"><strong>-${discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    </tr>
                ` : ''}
                <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding-right: 15px;"><strong>Total (INR):</strong></td>
                    <td class="amount-col"><strong>${invoice.currency} ${parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                </tr>
            </tbody>
        </table>

        <!-- Amount in Words -->
        <div class="amount-words">
            <strong>Amount in Words:</strong> 
            <span style="font-style: italic; color: #333;">${amountInWords}</span>
        </div>

        <!-- Notes Section -->
        ${invoice.notes ? `
            <div class="notes-section">
                <div class="notes-title">Notes:</div>
                <div class="notes-content">${invoice.notes}</div>
            </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <div class="footer-company">
                <strong>${invoice.billFrom.name}</strong><br>
                ${invoice.billFrom.address}<br>
                ${invoice.billFrom.city}, ${invoice.billFrom.state}<br>
                ${invoice.billFrom.country}
            </div>
            <div class="signature-section">
                <div class="signature-label">Issued by, signature:</div>
                <div class="seal-container">
                    <img src="/assets/seal.jpg" alt="Company Seal" class="seal-image" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="seal-fallback" style="display: none;">
                        <div class="seal-text-top">MANDARIN DECORS</div>
                        <div class="seal-logo">MS</div>
                        <div class="seal-text-bottom">Bengaluru</div>
                        <div class="seal-stars seal-star-left">★</div>
                        <div class="seal-stars seal-star-right">★</div>
                        <div class="seal-phone">Mob: +91 8971536537</div>
                    </div>
                </div>
                <div class="signatory-name">${invoice.billFrom.signatory}</div>
            </div>
        </div>

        <!-- Payment Details -->
        <div class="payment-details">
            <div class="payment-title">💳 PAYMENT DETAILS</div>
            <div class="payment-info">
                <strong>UPI ID:</strong> <span class="payment-value">mandarindecors@okhdfcbank</span>
            </div>
            <div class="payment-info">
                <strong>GPay / PhonePe:</strong> <span class="payment-value">+91 8971536537</span>
            </div>
            <div class="payment-note">
                For any payment queries, please contact us at the above details
            </div>
        </div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
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

          {/* Custom Units Management */}
          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Manage Quantity Units</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Add new unit (e.g., boxes, sets)"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomUnit()}
                />
                <button
                  onClick={addCustomUnit}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add Unit
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {customUnits.map(unit => (
                  <span
                    key={unit}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {unit}
                    {!['nos', 'no', 'pcs', 'kg', 'm', 'ft', 'sqft', 'hrs', 'rolls'].includes(unit) && (
                      <button
                        onClick={() => removeCustomUnit(unit)}
                        className="text-red-600 hover:text-red-800 ml-1"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Logo &amp; Seal:</strong> Place your logo as <code>/public/assets/logo.png</code> and seal as <code>/public/assets/seal.png</code> in your project folder for automatic display in invoices.
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Invoice List Header */}
          {!showForm && (
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">All Invoices</h2>
                <p className="text-sm text-gray-600">
                  Total: {invoices.length} invoice(s) | 
                  Clients: {predefinedClients.length} saved
                </p>
              </div>
            </div>
          )}
          {!showForm && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">Invoice #</th>
                    <th className="border border-gray-300 p-3 text-left">Client Details</th>
                    <th className="border border-gray-300 p-3 text-left">Date</th>
                    <th className="border border-gray-300 p-3 text-left">Due Date</th>
                    <th className="border border-gray-300 p-3 text-left">Total</th>
                    <th className="border border-gray-300 p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => {
                    const subtotal = invoice.items.reduce((sum, item) => sum + parseFloat(item.amount.toString() || '0'), 0);
                    const tax = (subtotal * parseFloat(invoice.tax.toString() || '0')) / 100;
                    const discount = parseFloat(invoice.discount.toString() || '0');
                    const total = (subtotal + tax - discount).toFixed(2);
                    
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">{invoice.invoiceNumber}</td>
                        <td className="border border-gray-300 p-3">
                          <div className="font-medium">{invoice.billTo.name}</div>
                          {invoice.billTo.company && (
                            <div className="text-sm text-gray-600">{invoice.billTo.company}</div>
                          )}
                          {invoice.billTo.phone && (
                            <div className="text-sm text-gray-500">{invoice.billTo.phone}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 p-3">{invoice.date}</td>
                        <td className="border border-gray-300 p-3">{invoice.dueDate}</td>
                        <td className="border border-gray-300 p-3">₹{parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="border border-gray-300 p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => generatePDF(invoice)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Download PDF"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => editInvoice(invoice)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => deleteInvoice(invoice.id as number)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="border border-gray-300 p-8 text-center text-gray-500">
                        No invoices yet. Click "New Invoice" to create your first professional invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Invoice Form */}
          {showForm && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingId ? 'Edit Invoice' : 'Create New Invoice'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={currentInvoice.invoiceNumber}
                    onChange={(e) => setCurrentInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="md061"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={currentInvoice.date}
                    onChange={(e) => setCurrentInvoice(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={currentInvoice.dueDate}
                    onChange={(e) => setCurrentInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={currentInvoice.paymentMethod}
                    onChange={(e) => setCurrentInvoice(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Transfer">Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>

              {/* Billing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill From (Company Details)</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={currentInvoice.billFrom.name}
                      onChange={(e) => setCurrentInvoice(prev => ({
                        ...prev,
                        billFrom: { ...prev.billFrom, name: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={currentInvoice.billFrom.address}
                      onChange={(e) => setCurrentInvoice(prev => ({
                        ...prev,
                        billFrom: { ...prev.billFrom, address: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="City, Area"
                      value={currentInvoice.billFrom.city}
                      onChange={(e) => setCurrentInvoice(prev => ({
                        ...prev,
                        billFrom: { ...prev.billFrom, city: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="State & PIN"
                        value={currentInvoice.billFrom.state}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          billFrom: { ...prev.billFrom, state: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={currentInvoice.billFrom.country}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          billFrom: { ...prev.billFrom, country: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Phone"
                        value={currentInvoice.billFrom.phone}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          billFrom: { ...prev.billFrom, phone: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Signatory Name"
                        value={currentInvoice.billFrom.signatory}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          billFrom: { ...prev.billFrom, signatory: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To (Client Details)</h3>
                  
                  {/* Client Selection Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
                    <select
                      value={selectedClient}
                      onChange={(e) => handleClientSelection(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="custom">Enter Custom Client Details</option>
                      {predefinedClients.map((client, index) => (
                        <option key={index} value={index.toString()}>
                          {client.name} - {client.phone}
                        </option>
                      ))}
                    </select>
                    {predefinedClients.length > 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {predefinedClients.length - 1} saved client(s) + Archierio Design Studio
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Client Name"
                      value={currentInvoice.billTo.name}
                      onChange={(e) => setCurrentInvoice(prev => ({
                        ...prev,
                        billTo: { ...prev.billTo, name: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={selectedClient !== 'custom'}
                    />
                    <input
                      type="text"
                      placeholder="Company Name (Optional)"
                      value={currentInvoice.billTo.company}
                      onChange={(e) => setCurrentInvoice(prev => ({
                        ...prev,
                        billTo: { ...prev.billTo, company: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={selectedClient !== 'custom'}
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={currentInvoice.billTo.phone}
                      onChange={(e) => setCurrentInvoice(prev => ({
                        ...prev,
                        billTo: { ...prev.billTo, phone: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={selectedClient !== 'custom'}
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={currentInvoice.billTo.address}
                      onChange={(e) => setCurrentInvoice(prev => ({
                        ...prev,
                        billTo: { ...prev.billTo, address: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={selectedClient !== 'custom'}
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={currentInvoice.billTo.city}
                      onChange={(e) => setCurrentInvoice(prev => ({
                        ...prev,
                        billTo: { ...prev.billTo, city: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={selectedClient !== 'custom'}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="State"
                        value={currentInvoice.billTo.state}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          billTo: { ...prev.billTo, state: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={selectedClient !== 'custom'}
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={currentInvoice.billTo.pincode}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          billTo: { ...prev.billTo, pincode: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={selectedClient !== 'custom'}
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={currentInvoice.billTo.country}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          billTo: { ...prev.billTo, country: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={selectedClient !== 'custom'}
                      />
                    </div>
                  </div>
                  
                  {selectedClient !== 'custom' && (
                    <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Selected:</strong> {predefinedClients[parseInt(selectedClient)]?.name}
                      </p>
                    </div>
                  )}
                  
                  {selectedClient === 'custom' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>💡 Auto-Save:</strong> This client will be automatically saved for future invoices when you save this invoice.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                  <button
                    onClick={addItem}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Description</th>
                        <th className="border border-gray-300 p-2 text-left w-20">Qty</th>
                        <th className="border border-gray-300 p-2 text-left w-20">Unit</th>
                        <th className="border border-gray-300 p-2 text-left w-24">Rate (₹)</th>
                        <th className="border border-gray-300 p-2 text-left w-24">Amount (₹)</th>
                        <th className="border border-gray-300 p-2 text-left w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Item description"
                              className="w-full p-1 border-0 focus:outline-none"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full p-1 border-0 focus:outline-none"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <select
                              value={item.unit}
                              onChange={(e) => updateItem(index, 'unit', e.target.value)}
                              className="w-full p-1 border-0 focus:outline-none"
                            >
                              {customUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full p-1 border-0 focus:outline-none"
                            />
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            ₹{parseFloat(item.amount.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                              disabled={currentInvoice.items.length === 1}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax (%):</span>
                    <input
                      type="number"
                      value={currentInvoice.tax}
                      onChange={(e) => setCurrentInvoice(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.1"
                      className="w-20 p-1 border border-gray-300 rounded text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Discount (₹):</span>
                    <input
                      type="number"
                      value={currentInvoice.discount}
                      onChange={(e) => setCurrentInvoice(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className="w-20 p-1 border border-gray-300 rounded text-right"
                    />
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{parseFloat(calculateTotal()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="text-sm text-blue-800 font-medium mb-1">Amount in Words:</div>
                    <div className="text-sm italic text-blue-700">
                      {numberToWords(parseFloat(calculateTotal()))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={currentInvoice.notes}
                  onChange={(e) => setCurrentInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or payment terms..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveInvoice}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingId ? 'Update Invoice' : 'Save Invoice'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
