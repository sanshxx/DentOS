import React from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../pdf/InvoicePDF';

export async function createInvoiceBlob(invoice) {
  const instance = pdf(<InvoicePDF invoice={invoice} />);
  const blob = await instance.toBlob();
  return blob;
}

export async function downloadInvoicePDF(invoice) {
  const blob = await createInvoiceBlob(invoice);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoice.invoiceNumber || 'Invoice'}_${new Date(invoice.invoiceDate).toLocaleDateString('en-IN').replace(/\s/g,'_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function openInvoicePDF(invoice) {
  const blob = await createInvoiceBlob(invoice);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}


