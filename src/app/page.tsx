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
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedUnits = localStorage.getItem('customUnits');
    
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
    if (savedUnits) {
      setCustomUnits(JSON.parse(savedUnits));
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('customUnits', JSON.stringify(customUnits));
  }, [customUnits]);

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
    (newItems[index] as any)[field] = value;
    
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
            margin: 0.5in;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #333333;
            background: white;
            font-size: 12px;
        }
        
        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
            min-height: 297mm;
        }
        
        /* Header Section */
     .header {
    padding: 20px 25px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
        
.company-section {
    display: flex;
    align-items: center;
    gap: 24px; /* more spacing to match bigger logo */
} 
        .logo-section {
            flex-shrink: 0;
        }
   .logo-image {
    width: 140px;  /* much bigger logo */
    height: 140px; /* much bigger logo */
    object-fit: contain;
    border-radius: 8px;
    flex-shrink: 0;
}

        
        .logo-fallback {
            width: 70px;
            height: 70px;
            background: #333;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            border-radius: 8px;
        }
        
        .company-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.company-info h1 {
    font-size: 20px;
    font-weight: bold;
    color: #222;
    margin-bottom: 2px;
}
        
        .trademark {
            font-size: 14px;
            vertical-align: super;
            margin-left: 2px;
        }
   .company-tagline {
    font-size: 12px;
    font-style: italic;
    color: #555;
    margin-bottom: 2px;
}
        
       .company-address {
    font-size: 11px;
    color: #666;
    max-width: 300px;
    line-height: 1.3;
}

        
        .invoice-title {
            flex: 1;
            text-align: right;
        }
        
        .invoice-title h1 {
    font-size: 28px;
    color: #8B1538;
    font-weight: bold;
    letter-spacing: 1px;
    margin: 0;
    text-transform: uppercase;
}
        
        /* Bill To and Invoice Details */
        .invoice-info {
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
        }
        
        .bill-to {
            flex: 1;
            margin-right: 50px;
        }
        
        .bill-to h3 {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .bill-to p {
            font-size: 12px;
            margin: 3px 0;
            color: #333;
            line-height: 1.3;
        }
        
        .invoice-details {
            text-align: right;
            flex: 1;
        }
        
        .invoice-details p {
            font-size: 12px;
            margin: 3px 0;
            color: #333;
            line-height: 1.3;
        }
        
        .invoice-details strong {
            font-weight: 600;
        }
        
        /* Burgundy Header Bar */
        .invoice-header-bar {
            background: #8B1538;
            color: white;
            padding: 20px 25px;
            margin: 25px 0;
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
            margin-bottom: 8px;
            opacity: 0.9;
            font-weight: normal;
        }
        
        .header-item p {
            font-size: 15px;
            font-weight: bold;
        }
        
        .total-due {
            text-align: right;
            flex: 1;
        }
        
        .total-due h4 {
            font-size: 12px;
            margin-bottom: 8px;
            opacity: 0.9;
            font-weight: normal;
        }
        
        .total-due p {
            font-size: 18px;
            font-weight: bold;
        }
        
        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            border: 2px solid #333;
            background: white;
        }
        
        .items-table th {
            background: #333;
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-size: 13px;
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
            padding: 12px;
            border-bottom: 1px solid #ddd;
            border-right: 1px solid #ddd;
            font-size: 12px;
            vertical-align: top;
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
            padding: 15px 12px;
            font-size: 15px;
            border-bottom: 2px solid #333;
        }
        
        .tax-row td {
            padding: 10px 12px;
            font-size: 12px;
            background: #f5f5f5;
        }
        
        /* Notes Section */
        .notes-section {
            margin: 25px 0;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #8B1538;
        }
        
        .notes-title {
            font-weight: bold;
            font-size: 13px;
            color: #8B1538;
            margin-bottom: 8px;
        }
        
        .notes-content {
            font-size: 12px;
            color: #333;
            line-height: 1.4;
        }
        
        /* Footer */
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 50px;
            padding-top: 25px;
            border-top: 1px solid #ddd;
        }
        
        .footer-company {
            flex: 1;
            font-size: 11px;
            color: #666;
            line-height: 1.4;
            max-width: 250px;
        }
        
        .footer-company strong {
            color: #333;
            font-size: 12px;
        }
        
        .signature-section {
            text-align: center;
            flex: 1;
        }
        
        .signature-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 25px;
        }
        
        .seal-container {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
        }
        
        .seal-image {
            width: 120px;
            height: 120px;
            object-fit: contain;
        }
        
        .seal-fallback {
            width: 120px;
            height: 120px;
            border: 3px solid #333;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            background: white;
        }
        
        .seal-text-top {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .seal-logo {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .seal-text-bottom {
            font-size: 10px;
            font-weight: bold;
        }
        
        .seal-stars {
            position: absolute;
            font-size: 12px;
        }
        
        .seal-star-left {
            left: 15px;
            bottom: 25px;
        }
        
        .seal-star-right {
            right: 15px;
            bottom: 25px;
        }
        
        .seal-phone {
            position: absolute;
            bottom: 8px;
            font-size: 9px;
            font-weight: bold;
        }
        
        .signatory-name {
            font-size: 13px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 10px;
            display: inline-block;
            min-width: 200px;
            color: #333;
        }
        
        /* Payment Details */
        .payment-details {
            margin-top: 40px;
            padding: 20px;
            border: 2px solid #8B1538;
            border-radius: 8px;
            background: #f9f9f9;
            text-align: center;
        }
        
        .payment-title {
            font-size: 16px;
            font-weight: bold;
            color: #8B1538;
            margin-bottom: 15px;
        }
        
        .payment-info {
            font-size: 13px;
            margin: 8px 0;
            color: #333;
        }
        
        .payment-value {
            font-weight: bold;
            color: #8B1538;
        }
        
        .payment-note {
            font-size: 11px;
            color: #666;
            margin-top: 12px;
            font-style: italic;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
                font-size: 11px;
            }
            
            .invoice-container {
                max-width: none;
                padding: 15px;
                margin: 0;
            }
            
            .payment-details {
                page-break-inside: avoid;
                margin-top: 30px;
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
            <div class="company-section">
                <div class="logo-section">
                    <img src="/assets/logo.png" alt="Company Logo" class="logo-image" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="logo-fallback" style="display: none;">MS</div>
                </div>
                <div class="company-info">
                    <h1>${invoice.billFrom.name}<span class="trademark">™</span></h1>
                    <div class="company-tagline">Interiors that Reflects You</div>
                    <div class="company-address">
                        ${invoice.billFrom.address}<br>
                        ${invoice.billFrom.city}, ${invoice.billFrom.state}<br>
                        ${invoice.billFrom.country}
                    </div>
                </div>
            </div>
            <div class="invoice-title">
                <h1>Invoice</h1>
            </div>
        </div>

        <!-- Bill To and Invoice Details -->
        <div class="invoice-info">
            <div class="bill-to">
                <h3>BILL TO</h3>
                <p><strong>${invoice.billTo.name}</strong></p>
                ${invoice.billTo.company ? `<p><strong>${invoice.billTo.company}</strong></p>` : ''}
                <p>${invoice.billTo.address}</p>
                <p>${invoice.billTo.city}, ${invoice.billTo.state}</p>
                <p>${invoice.billTo.country}</p>
                ${invoice.billTo.phone ? `<p> ${invoice.billTo.phone}</p>` : ''}
            </div>
            <div class="invoice-details">
                <p><strong>Invoice No.:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Issue date:</strong> ${new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p><strong>Due date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <br>
                <p><strong>Payment method:</strong> ${invoice.paymentMethod}</p>
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
        <div style="margin: 15px 0; padding: 12px; background: #f0f8ff; border: 1px solid #8B1538; border-radius: 5px;">
            <strong style="color: #8B1538;">Amount in Words:</strong> 
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
                        <div class="seal-phone">Mob: ${invoice.billFrom.phone}</div>
                    </div>
                </div>
                <div class="signatory-name">${invoice.billFrom.signatory} ${invoice.billFrom.phone}</div>
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
                  <strong>Logo & Seal:</strong> Place your logo as <code>/public/assets/logo.png</code> and seal as <code>/public/assets/seal.png</code> in your project folder for automatic display in invoices.
                </p>
              </div>
            </div>
          )}

          {/* Invoice List */}
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
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="State"
                        value={currentInvoice.billTo.state}
                        onChange={(e) => setCurrentInvoice(prev => ({
                          ...prev,
                          billTo: { ...prev.billTo, state: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
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
                      />
                    </div>
                  </div>
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