import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Format currency for PDF
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Format date for PDF
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to convert numbers to words
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num === 0) return 'Zero';
  
  const convertLessThanOneThousand = (num) => {
    if (num === 0) return '';
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    }
    if (num < 1000) {
      return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertLessThanOneThousand(num % 100) : '');
    }
  };
  
  const convert = (num) => {
    if (num === 0) return 'Zero';
    
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;
    
    let result = '';
    
    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder);
    }
    
    return result.trim();
  };
  
  return convert(Math.floor(num)) + ' Rupees Only';
};

// Generate HTML template for invoice
const generateInvoiceHTML = (invoice) => {
  // Prepare data for the template
  const invoiceData = {
    invoice_number: invoice.invoiceNumber || 'INV-001',
    invoice_date: formatDate(invoice.invoiceDate),
    due_date: formatDate(invoice.dueDate),
    biller: {
      name: 'DentOS',
      address_line_1: '123 Dental Street',
      address_line_2: 'Mumbai, India',
      bank_details: {
        account_name: 'DENTOS SERVICES',
        account_number: '123456789012',
        ifsc: 'ICIC0000001',
        bank_name: 'ICICI BANK',
        account_type: 'Current'
      },
      upi_id: 'dentos@okicici'
    },
    client: {
      name: invoice.patient.name,
      address_line_1: invoice.patient.email || '',
      address_line_2: invoice.patient.phone || ''
    },
    items: [],
    summary: {
      total: invoice.totalAmount || 0,
      total_in_words: numberToWords(invoice.totalAmount || 0)
    },
    terms_and_conditions: [
      'Payment is due within the specified due date.',
      'Late payments may incur additional charges.',
      'All amounts are in Indian Rupees (INR).',
      'For any queries, please contact our office.',
      'This invoice is computer generated and valid without signature.'
    ],
    contact: {
      email: 'info@dentos.com',
      phone: '+91 22 1234 5678'
    }
  };

  // Convert invoice items to template format
  if (invoice.items && invoice.items.length > 0) {
    invoiceData.items = invoice.items.map((item, index) => ({
      description: item.name || item.description || 'Dental Service',
      details: item.details || item.notes || '',
      amount: item.cost || item.amount || item.unitPrice || 0
    }));
  } else if (invoice.treatments && invoice.treatments.length > 0) {
    invoiceData.items = invoice.treatments.map((treatment, index) => ({
      description: treatment.name || 'Dental Treatment',
      details: treatment.details || treatment.notes || '',
      amount: treatment.cost || 0
    }));
  } else {
    // Fallback: create a single line item
    invoiceData.items = [{
      description: 'Dental Services',
      details: 'Professional dental care services',
      amount: invoice.totalAmount || 0
    }];
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceData.invoice_number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #1976d2;
          padding-bottom: 20px;
        }
        
        .invoice-title {
          font-size: 36px;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 15px;
        }
        
        .invoice-details {
          font-size: 14px;
          color: #666;
        }
        
        .invoice-details div {
          margin-bottom: 5px;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          background: #1976d2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        
        .billing-sections {
          display: flex;
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .billing-box {
          flex: 1;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
        }
        
        .billing-title {
          font-size: 16px;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 15px;
        }
        
        .billing-content {
          font-size: 14px;
          line-height: 1.8;
        }
        
        .billing-content strong {
          color: #333;
        }
        
        .items-section {
          margin-bottom: 40px;
        }
        
        .items-title {
          font-size: 20px;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 15px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .items-table th {
          background: #1976d2;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: bold;
        }
        
        .items-table td {
          padding: 15px;
          border-bottom: 1px solid #e9ecef;
          vertical-align: top;
        }
        
        .items-table tr:last-child td {
          border-bottom: none;
        }
        
        .item-description {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .item-details {
          font-size: 12px;
          color: #666;
          margin-left: 20px;
        }
        
        .item-amount {
          font-weight: bold;
          text-align: right;
        }
        
        .total-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        
        .total-words {
          font-size: 14px;
          color: #666;
          max-width: 60%;
        }
        
        .total-box {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          min-width: 150px;
        }
        
        .total-label {
          font-size: 14px;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 10px;
        }
        
        .total-amount {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
        
        .payment-section {
          display: flex;
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .payment-box {
          flex: 1;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
        }
        
        .payment-title {
          font-size: 16px;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 15px;
        }
        
        .bank-details {
          font-size: 12px;
          line-height: 1.8;
        }
        
        .bank-details div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .bank-details strong {
          color: #333;
        }
        
        .upi-section {
          text-align: center;
        }
        
        .upi-note {
          font-size: 11px;
          color: #666;
          margin-bottom: 15px;
        }
        
        .upi-qr-placeholder {
          width: 100px;
          height: 100px;
          background: #e9ecef;
          border: 1px solid #ddd;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #666;
        }
        
        .upi-id {
          font-size: 12px;
          font-weight: bold;
          color: #333;
        }
        
        .terms-section {
          margin-bottom: 30px;
        }
        
        .terms-title {
          font-size: 18px;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 15px;
        }
        
        .terms-list {
          list-style: none;
          padding-left: 0;
        }
        
        .terms-list li {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }
        
        .terms-list li:before {
          content: counter(terms-counter) ".";
          counter-increment: terms-counter;
          position: absolute;
          left: 0;
          font-weight: bold;
          color: #1976d2;
        }
        
        .contact-section {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 12px;
          color: #666;
        }
        
        .contact-section strong {
          color: #1976d2;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .invoice-header {
            page-break-inside: avoid;
          }
          
          .billing-sections {
            page-break-inside: avoid;
          }
          
          .items-section {
            page-break-inside: avoid;
          }
          
          .total-section {
            page-break-inside: avoid;
          }
          
          .payment-section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <div class="invoice-title">Invoice</div>
          <div class="invoice-details">
            <div><strong>Invoice No #</strong> ${invoiceData.invoice_number}</div>
            <div><strong>Invoice Date</strong> ${invoiceData.invoice_date}</div>
            <div><strong>Due Date</strong> ${invoiceData.due_date}</div>
          </div>
        </div>
        <div class="logo">DC</div>
      </div>
      
      <div class="billing-sections">
        <div class="billing-box">
          <div class="billing-title">Billed By</div>
          <div class="billing-content">
            <strong>${invoiceData.biller.name}</strong><br>
            ${invoiceData.biller.address_line_1}<br>
            ${invoiceData.biller.address_line_2}
          </div>
        </div>
        
        <div class="billing-box">
          <div class="billing-title">Billed To</div>
          <div class="billing-content">
            <strong>${invoiceData.client.name}</strong><br>
            ${invoiceData.client.address_line_1}<br>
            ${invoiceData.client.address_line_2}
          </div>
        </div>
      </div>
      
      <div class="items-section">
        <div class="items-title">Item Details</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map((item, index) => `
              <tr>
                <td>
                  <div class="item-description">${index + 1}. ${item.description}</div>
                  ${item.details ? `<div class="item-details">${item.details}</div>` : ''}
                </td>
                <td class="item-amount">${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="total-section">
        <div class="total-words">
          <strong>Total (in words):</strong> ${invoiceData.summary.total_in_words}
        </div>
        <div class="total-box">
          <div class="total-label">Total (INR)</div>
          <div class="total-amount">${formatCurrency(invoiceData.summary.total)}</div>
        </div>
      </div>
      
      <div class="payment-section">
        <div class="payment-box">
          <div class="payment-title">Bank Details</div>
          <div class="bank-details">
            <div><strong>Account Name:</strong> ${invoiceData.biller.bank_details.account_name}</div>
            <div><strong>Account Number:</strong> ${invoiceData.biller.bank_details.account_number}</div>
            <div><strong>IFSC:</strong> ${invoiceData.biller.bank_details.ifsc}</div>
            <div><strong>Account Type:</strong> ${invoiceData.biller.bank_details.account_type}</div>
            <div><strong>Bank:</strong> ${invoiceData.biller.bank_details.bank_name}</div>
          </div>
        </div>
        
        <div class="payment-box">
          <div class="payment-title">UPI - Scan to Pay</div>
          <div class="upi-section">
            <div class="upi-note">(Maximum of 1 Lakh can be transferred via UPI)</div>
            <div class="upi-qr-placeholder">QR Code</div>
            <div class="upi-id">${invoiceData.biller.upi_id}</div>
          </div>
        </div>
      </div>
      
      <div class="terms-section">
        <div class="terms-title">Terms and Conditions</div>
        <ol class="terms-list" style="counter-reset: terms-counter 1;">
          ${invoiceData.terms_and_conditions.map(term => `
            <li>${term}</li>
          `).join('')}
        </ol>
      </div>
      
      <div class="contact-section">
        For any enquiry, reach out via email at <strong>${invoiceData.contact.email}</strong>, call on <strong>${invoiceData.contact.phone}</strong>
      </div>
    </body>
    </html>
  `;
};

// Generate PDF from HTML
const generateInvoicePDF = async (invoice) => {
  try {
    // Create temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px';
    container.style.backgroundColor = 'white';
    
    // Generate HTML content
    container.innerHTML = generateInvoiceHTML(invoice);
    document.body.appendChild(container);
    
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: container.scrollHeight
    });
    
    // Remove temporary container
    document.body.removeChild(container);
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw new Error('Failed to generate PDF from HTML');
  }
};

// Print invoice
export const printInvoice = async (invoice) => {
  try {
    // Create a temporary div for printing
    const printDiv = document.createElement('div');
    printDiv.style.position = 'absolute';
    printDiv.style.left = '-9999px';
    printDiv.style.top = '-9999px';
    printDiv.style.width = '800px';
    printDiv.style.backgroundColor = 'white';
    
    // Generate HTML content
    printDiv.innerHTML = generateInvoiceHTML(invoice);
    document.body.appendChild(printDiv);
    
    // Print the content
    window.print();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(printDiv);
    }, 1000);
    
  } catch (error) {
    console.error('Error printing invoice:', error);
    throw new Error('Failed to print invoice');
  }
};

// Download invoice as PDF
export const downloadInvoicePDF = async (invoice) => {
  try {
    const pdf = await generateInvoicePDF(invoice);
    const filename = `${invoice.invoiceNumber}_${formatDate(invoice.invoiceDate).replace(/\s/g, '_')}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw new Error('Failed to download invoice');
  }
};

// Download invoice as CSV
export const downloadInvoiceCSV = (invoice) => {
  try {
    const csvContent = [
      ['Invoice Details'],
      ['Invoice Number', invoice.invoiceNumber],
      ['Date', formatDate(invoice.invoiceDate)],
      ['Due Date', formatDate(invoice.dueDate)],
      ['Status', invoice.paymentStatus],
      [''],
      ['Patient Information'],
      ['Name', invoice.patient.name],
      ['Email', invoice.patient.email || ''],
      ['Phone', invoice.patient.phone || ''],
      ['Address', invoice.patient.address || ''],
      [''],
      ['Services'],
      ['Description', 'Quantity', 'Rate', 'Amount']
    ];
    
    // Add services
    (() => {
      let items = [];
      if (invoice.items && invoice.items.length > 0) {
        items = invoice.items;
      } else if (invoice.treatments && invoice.treatments.length > 0) {
        items = invoice.treatments;
      } else if (invoice.services && invoice.services.length > 0) {
        items = invoice.services;
      } else {
        // Fallback: create a single line item
        items = [{
          description: 'Dental Services',
          quantity: 1,
          unitPrice: invoice.totalAmount || 0,
          amount: invoice.totalAmount || 0
        }];
      }
      
      items.forEach(item => {
        csvContent.push([
          item.name || item.description || 'Service',
          item.quantity || 1,
          item.cost || item.rate || item.unitPrice || 0,
          item.cost || item.amount || 0
        ]);
      });
    })();
    
    csvContent.push(['']);
    csvContent.push(['Subtotal', '', '', invoice.subtotal || invoice.totalAmount]);
    if (invoice.taxAmount && invoice.taxAmount > 0) {
      csvContent.push(['Tax', '', '', invoice.taxAmount]);
    }
    if (invoice.discountAmount && invoice.discountAmount > 0) {
      csvContent.push(['Discount', '', '', -invoice.discountAmount]);
    }
    csvContent.push(['Total', '', '', invoice.totalAmount]);
    if (invoice.amountPaid && invoice.amountPaid > 0) {
      csvContent.push(['Paid', '', '', invoice.amountPaid]);
      csvContent.push(['Balance Due', '', '', invoice.balanceAmount || (invoice.totalAmount - invoice.amountPaid)]);
    }
    
    // Add payment history
    if (invoice.payments && invoice.payments.length > 0) {
      csvContent.push(['']);
      csvContent.push(['Payment History']);
      csvContent.push(['Date', 'Amount', 'Method', 'Reference']);
      invoice.payments.forEach(payment => {
        csvContent.push([
          formatDate(payment.paymentDate),
          payment.amount,
          payment.paymentMethod,
          payment.reference || ''
        ]);
      });
    }
    
    // Convert to CSV string
    const csvString = csvContent.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${invoice.invoiceNumber}_${formatDate(invoice.invoiceDate).replace(/\s/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw new Error('Failed to download CSV');
  }
}; 