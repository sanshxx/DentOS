import React from 'react';
import { pdf } from '@react-pdf/renderer';
import PrescriptionPDF from '../pdf/PrescriptionPDF';

export async function createPrescriptionBlob(prescription) {
  const instance = pdf(<PrescriptionPDF prescription={prescription} />);
  const blob = await instance.toBlob();
  return blob;
}

export async function downloadPrescriptionPDF(prescription) {
  const blob = await createPrescriptionBlob(prescription);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileName = `Prescription_${prescription.prescriptionNumber || 'RX'}_${(prescription.patient?.name || 'Patient').replace(/\s+/g,'_')}.pdf`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function openPrescriptionPDF(prescription) {
  const blob = await createPrescriptionBlob(prescription);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
