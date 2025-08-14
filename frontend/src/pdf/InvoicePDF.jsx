import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles inspired by the reference: clean, modern, plenty of whitespace
const styles = StyleSheet.create({
  // Global styles per spec
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#212529', backgroundColor: '#FFFFFF' },
  container: { width: 520, alignSelf: 'center' }, // approx 520pt max width, centered
  headerTitle: { textAlign: 'center', fontSize: 40, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' },
  // Top-right details under the title
  detailsBlock: { alignSelf: 'flex-end', width: '60%', marginBottom: 10 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  // blocks/cards
  card: { flex: 1, border: '1px solid #E5E7EB', borderRadius: 6, padding: 10 },
  cardTitle: { color: '#212529', fontWeight: 700, fontSize: 12, marginBottom: 6 },
  label: { color: '#6B7280' },
  value: { fontWeight: 700 },
  sectionTitle: { color: '#212529', fontWeight: 700, marginTop: 8, marginBottom: 6 },
  divider: { borderTop: '1px solid #E5E7EB', marginVertical: 6 },
  // table
  table: { borderTop: '1px solid #E5E7EB', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottom: '1px solid #F3F4F6' },
  th: { fontWeight: 700 },
  itemCol: { width: '72%' },
  amtCol: { width: '28%', textAlign: 'right' },
  totalWrap: { alignItems: 'flex-end' },
  totalCard: { border: '1px solid #E5E7EB', borderRadius: 6, padding: 10, marginTop: 8, width: '55%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { color: '#374151' },
  totalValue: { fontWeight: 700 },
  totalInWords: { fontStyle: 'italic', color: '#374151' },
  footer: { marginTop: 12 },
  muted: { color: '#6B7280' }
});

// Render amounts without the '₹' symbol to avoid unsupported glyphs showing as superscripts
const formatINR = (v) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

// Minimal number to words (Indian system, rupees only)
function numberToWords(num) {
  if (!num || num <= 0) return 'ZERO RUPEES ONLY';
  const a = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' AND ' + inWords(n % 100) : '');
    return '';
  };
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;
  let str = '';
  if (crore) str += inWords(crore) + ' CRORE ';
  if (lakh) str += inWords(lakh) + ' LAKH ';
  if (thousand) str += inWords(thousand) + ' THOUSAND ';
  if (rest) str += inWords(rest);
  return (str.trim() + ' RUPEES ONLY').replace(/\s+/g, ' ');
}

export default function InvoicePDF({ invoice }) {
  const billedBy = invoice?.organization || {}; // optional future enhancement
  const billedTo = invoice?.patient || invoice?.client || {};

  // Items: support detailed descriptions via `details`/`notes`
  const items = (invoice?.items?.length ? invoice.items :
    (invoice?.treatments?.length ? invoice.treatments : [{ description: 'Dental Services', amount: invoice?.totalAmount || 0 }])
  ).map((it, idx) => ({
    title: it.name || it.description || `Item ${idx + 1}`,
    details: it.details || it.notes || '',
    amount: it.cost || it.amount || it.unitPrice || 0
  }));

  const subtotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const gstRate = 0.18;
  const gstAmount = Math.round(subtotal * gstRate);
  const total = subtotal + gstAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.headerTitle}>Invoice</Text>

          {/* Details block top-right */}
          <View style={styles.detailsBlock}>
            <View style={styles.detailsRow}><Text>Invoice No #</Text><Text style={{ fontWeight: 600 }}>{invoice?.invoiceNumber || '-'}</Text></View>
            <View style={styles.detailsRow}><Text>Invoice Date</Text><Text style={{ fontWeight: 600 }}>{formatDate(invoice?.invoiceDate)}</Text></View>
            <View style={styles.detailsRow}><Text>Due Date</Text><Text style={{ fontWeight: 600 }}>{formatDate(invoice?.dueDate)}</Text></View>
          </View>

          {/* Biller & Client */}
          <View style={styles.headerRow}>
            {/* Billed By */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Billed By</Text>
              <Text style={{ fontWeight: 700 }}>{billedBy.name || 'DentOS'}</Text>
              <Text>{billedBy.address?.street || '123 Dental Street'}</Text>
              <Text>{billedBy.address?.city ? `${billedBy.address.city}${billedBy.address?.state ? `, ${billedBy.address.state}` : ''}` : 'Mumbai, India'}</Text>
            </View>

            {/* Billed To */}
            <View style={styles.card}> 
              <Text style={styles.cardTitle}>Billed To</Text>
              <Text style={{ fontWeight: 700 }}>{billedTo.name || ''}</Text>
              {billedTo.address ? (
                <>
                  {billedTo.address.street ? <Text>{billedTo.address.street}</Text> : null}
                  {billedTo.address.city || billedTo.address.state ? (
                    <Text>{(billedTo.address.city || '') + (billedTo.address.state ? `, ${billedTo.address.state}` : '')}</Text>
                  ) : null}
                </>
              ) : (
                <>
                  {billedTo.email ? <Text>{billedTo.email}</Text> : null}
                  {billedTo.phone ? <Text>{billedTo.phone}</Text> : null}
                </>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items */}
          <Text style={styles.sectionTitle}>Item</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.th]}>
              <Text style={styles.itemCol}>Description</Text>
              <Text style={styles.amtCol}>Amount</Text>
            </View>
            {items.map((it, i) => (
              <View key={i} style={styles.row}>
                <View style={styles.itemCol}>
                  <Text style={{ fontWeight: 700 }}>{i + 1}. {it.title}</Text>
                  {it.details ? (
                    <>
                      {String(it.details).split(',').map((seg, idx2) => (
                        <Text key={idx2} style={[styles.muted, { marginLeft: 6 }]}>
                          {seg.trim()}
                        </Text>
                      ))}
                    </>
                  ) : null}
                </View>
                <Text style={styles.amtCol}>{formatINR(it.amount)}</Text>
              </View>
            ))}

            {/* totals as part of table visually, with top border before subtotal */}
            <View style={{ borderTop: '1px solid #E5E7EB' }} />
          </View>

          {/* Totals */}
          <View style={styles.totalWrap}>
            <View style={styles.totalCard}>
              <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{formatINR(subtotal)}</Text></View>
              <View style={styles.totalRow}><Text style={styles.totalLabel}>GST (18%)</Text><Text style={styles.totalValue}>{formatINR(gstAmount)}</Text></View>
              <View style={[styles.totalRow, { marginTop: 4 }]}>
                <Text style={[styles.totalLabel, { fontWeight: 700 }]}>Total (INR)</Text>
                <Text style={[styles.totalValue, { fontSize: 12 }]}>{formatINR(total)}</Text>
              </View>
            </View>
          </View>

          {/* Total in words */}
          <View style={{ marginTop: 6 }}>
            <Text style={styles.totalInWords}>Total (in words): {numberToWords(Math.round(total))}</Text>
          </View>

          {/* Footer */}
          <View style={styles.divider} />
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>Terms and Conditions</Text>
            {/* Render a simple ordered list */}
            <View style={{ marginTop: 2 }}>
              {(invoice?.termsList || [
                'Payment is due within the specified due date.',
                'All amounts are in INR.',
              ]).map((t, i) => (
                <Text key={i} style={styles.muted}>{i + 1}. {t}</Text>
              ))}
            </View>
            <View style={{ borderTop: '1px solid #E5E7EB', marginTop: 8, paddingTop: 6 }}>
              <Text style={{ textAlign: 'center' }}>
                For any enquiry, reach out via email at {invoice?.contactEmail || 'info@dentos.com'}, call on {invoice?.contactPhone || '+91 22 1234 5678'}.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}


