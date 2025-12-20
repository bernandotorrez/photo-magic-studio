import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Payment {
  id: string;
  user_email: string;
  amount: number;
  unique_code: number;
  amount_with_code: number;
  tokens_purchased: number;
  bonus_tokens: number;
  price_per_token: number;
  payment_status: string;
  payment_method: string;
  subscription_plan: string;
  token_type: string;
  created_at: string;
  verified_at: string;
}

export const generateInvoicePDF = async (payment: Payment, customerName: string) => {
  const doc = new jsPDF();
  
  // Company Info
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PHOTO MAGIC STUDIO', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Photo Enhancement Platform', 105, 27, { align: 'center' });
  doc.text('www.photomagicstudio.com', 105, 32, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 38, 190, 38);
  
  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 48);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const invoiceNumber = `INV-${payment.id.substring(0, 8).toUpperCase()}`;
  const invoiceDate = format(new Date(payment.created_at), 'dd MMMM yyyy', { locale: idLocale });
  const verifiedDate = payment.verified_at 
    ? format(new Date(payment.verified_at), 'dd MMMM yyyy', { locale: idLocale })
    : '-';
  
  doc.text(`No. Invoice: ${invoiceNumber}`, 20, 56);
  doc.text(`Tanggal: ${invoiceDate}`, 20, 62);
  doc.text(`Status: LUNAS`, 20, 68);
  doc.text(`Tanggal Verifikasi: ${verifiedDate}`, 20, 74);
  
  // Customer Info
  doc.setFont('helvetica', 'bold');
  doc.text('KEPADA:', 120, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, 120, 62);
  doc.text(payment.user_email, 120, 68);
  
  // Payment Type
  let paymentType = 'Top-Up Token';
  if (payment.token_type === 'subscription' && payment.subscription_plan) {
    paymentType = `Paket ${payment.subscription_plan.replace('_', ' ').toUpperCase()}`;
  }
  
  // Items Table
  const tableData = [
    [
      '1',
      paymentType,
      `${payment.tokens_purchased} token`,
      `Rp ${payment.price_per_token.toLocaleString('id-ID')}`,
      `Rp ${payment.amount.toLocaleString('id-ID')}`
    ]
  ];
  
  // Add bonus tokens row if applicable
  if (payment.bonus_tokens > 0) {
    tableData.push([
      '2',
      'Bonus Token',
      `${payment.bonus_tokens} token`,
      'Rp 0',
      'Rp 0'
    ]);
  }
  
  autoTable(doc, {
    startY: 85,
    head: [['No', 'Deskripsi', 'Jumlah', 'Harga Satuan', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 70 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 }
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    }
  });
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  
  // Summary Section
  const summaryY = finalY + 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 130, summaryY);
  doc.text(`Rp ${payment.amount.toLocaleString('id-ID')}`, 190, summaryY, { align: 'right' });
  
  doc.text('Kode Unik:', 130, summaryY + 6);
  doc.text(`Rp ${payment.unique_code.toLocaleString('id-ID')}`, 190, summaryY + 6, { align: 'right' });
  
  // Total line
  doc.setLineWidth(0.3);
  doc.line(130, summaryY + 10, 190, summaryY + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 130, summaryY + 16);
  doc.text(`Rp ${payment.amount_with_code.toLocaleString('id-ID')}`, 190, summaryY + 16, { align: 'right' });
  
  // Payment Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI PEMBAYARAN', 20, summaryY + 30);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Metode: ${payment.payment_method}`, 20, summaryY + 37);
  doc.text(`Status: LUNAS`, 20, summaryY + 43);
  
  // Total Tokens
  const totalTokens = payment.tokens_purchased + payment.bonus_tokens;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TOKEN DITERIMA', 20, summaryY + 55);
  doc.setFontSize(14);
  doc.setTextColor(34, 197, 94); // Green color
  doc.text(`${totalTokens} TOKEN`, 20, summaryY + 62);
  
  if (payment.bonus_tokens > 0) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`(${payment.tokens_purchased} token + ${payment.bonus_tokens} bonus)`, 20, summaryY + 68);
  }
  
  // Footer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const footerY = 270;
  doc.text('Terima kasih atas kepercayaan Anda menggunakan Photo Magic Studio', 105, footerY, { align: 'center' });
  doc.text('Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan', 105, footerY + 5, { align: 'center' });
  
  // Save PDF
  const fileName = `Invoice_${invoiceNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
};
