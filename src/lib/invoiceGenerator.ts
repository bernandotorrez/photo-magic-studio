import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import jsPDF from 'jspdf';

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
  invoice_no: string | null;
  created_at: string;
  verified_at: string;
}

export const generateInvoicePDF = async (payment: Payment, customerName: string) => {
  const invoiceNo = payment.invoice_no || `INV-${payment.id.substring(0, 8).toUpperCase()}`;
  const invoiceDateFull = format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: idLocale });
  
  // Create PDF directly without html2canvas
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  
  // Colors
  const primaryColor = '#2563eb';
  const textColor = '#374151';
  const grayColor = '#6b7280';
  const lightGray = '#e5e7eb';
  
  // Helper function to add text
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    pdf.setFontSize(options.size || 10);
    pdf.setTextColor(options.color || textColor);
    if (options.bold) pdf.setFont('helvetica', 'bold');
    else pdf.setFont('helvetica', 'normal');
    pdf.text(text, x, y, options.align ? { align: options.align } : undefined);
  };
  
  // Header - Company Name
  pdf.setTextColor(primaryColor);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PixelNova AI', margin, yPos);
  yPos += 7;
  
  // Tagline
  pdf.setFontSize(9);
  pdf.setTextColor(grayColor);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Enhance images instantly with AI-powered precision', margin, yPos);
  yPos += 5;
  pdf.text('Support: Whatsapp (+62 896-8761-0639)', margin, yPos);
  
  // Invoice Number (right side)
  pdf.setFontSize(18);
  pdf.setTextColor(textColor);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Invoice ${invoiceNo}`, pageWidth - margin, margin, { align: 'right' });
  pdf.setFontSize(9);
  pdf.setTextColor(grayColor);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoiceDateFull, pageWidth - margin, margin + 7, { align: 'right' });
  
  yPos += 10;
  
  // Line separator
  pdf.setDrawColor(lightGray);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // From/To Section
  const halfWidth = contentWidth / 2;
  
  // From
  pdf.setFontSize(11);
  pdf.setTextColor(textColor);
  pdf.setFont('helvetica', 'bold');
  pdf.text('From:', margin, yPos);
  yPos += 6;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PixelNova AI', margin, yPos);
  yPos += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(grayColor);
  pdf.text('Enhance images instantly with AI-powered precision', margin, yPos);
  yPos += 5;
  pdf.text('support@pixelnovaai.com', margin, yPos);
  
  // To (right side)
  const toYPos = yPos - 16;
  pdf.setFontSize(11);
  pdf.setTextColor(textColor);
  pdf.setFont('helvetica', 'bold');
  pdf.text('To:', margin + halfWidth, toYPos);
  
  pdf.setFontSize(9);
  pdf.text(customerName, margin + halfWidth, toYPos + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(grayColor);
  pdf.text(payment.user_email, margin + halfWidth, toYPos + 11);
  
  yPos += 15;
  
  // Table Header
  const tableTop = yPos;
  const colWidths = [contentWidth * 0.4, contentWidth * 0.2, contentWidth * 0.2, contentWidth * 0.2];
  const colX = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
  
  // Table header background
  pdf.setFillColor(249, 250, 251);
  pdf.rect(margin, tableTop, contentWidth, 8, 'F');
  
  // Table header text
  pdf.setFontSize(9);
  pdf.setTextColor(textColor);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', colX[0] + 2, tableTop + 5.5);
  pdf.text('Tokens', colX[1] + 2, tableTop + 5.5);
  pdf.text('Amount', colX[2] + 2, tableTop + 5.5);
  pdf.text('Status', colX[3] + 2, tableTop + 5.5);
  
  yPos = tableTop + 8;
  
  // Table header line
  pdf.setDrawColor(lightGray);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;
  
  // Table content
  const description = payment.token_type === 'subscription' && payment.subscription_plan 
    ? `Paket ${payment.subscription_plan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` 
    : payment.subscription_plan && payment.subscription_plan !== 'free'
      ? `Paket ${payment.subscription_plan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
      : 'Top-Up Token';
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(textColor);
  pdf.text(description, colX[0] + 2, yPos);
  
  if (payment.bonus_tokens > 0) {
    yPos += 4;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#10b981');
    pdf.text(`+ ${payment.bonus_tokens} Bonus Tokens`, colX[0] + 2, yPos);
    yPos += 2;
  }
  
  const rowY = payment.bonus_tokens > 0 ? yPos - 6 : yPos;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(grayColor);
  pdf.text(`${payment.tokens_purchased} tokens`, colX[1] + 2, rowY);
  pdf.text(`Rp ${payment.amount.toLocaleString('id-ID')}`, colX[2] + 2, rowY);
  pdf.setTextColor('#10b981');
  pdf.setFont('helvetica', 'bold');
  pdf.text('LUNAS', colX[3] + 2, rowY);
  
  yPos += 6;
  
  // Table bottom line
  pdf.setDrawColor(lightGray);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // Unique Code Box (if exists)
  if (payment.unique_code > 0) {
    pdf.setFillColor(254, 243, 199);
    pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'FD');
    
    pdf.setFontSize(8);
    pdf.setTextColor('#92400e');
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Kode Unik: Rp ${payment.unique_code.toLocaleString('id-ID')}`, margin + 3, yPos + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Kode unik ditambahkan untuk memudahkan verifikasi pembayaran', margin + 3, yPos + 9);
    yPos += 17;
  }
  
  // Totals section (right aligned)
  const totalsX = pageWidth - margin - 70;
  const totalsWidth = 70;
  
  pdf.setFontSize(9);
  pdf.setTextColor(grayColor);
  pdf.setFont('helvetica', 'normal');
  
  // Subtotal
  pdf.text('Subtotal:', totalsX, yPos);
  pdf.text(`Rp ${payment.amount.toLocaleString('id-ID')}`, totalsX + totalsWidth, yPos, { align: 'right' });
  yPos += 5;
  pdf.setDrawColor(lightGray);
  pdf.setLineWidth(0.2);
  pdf.line(totalsX, yPos, totalsX + totalsWidth, yPos);
  yPos += 5;
  
  // Kode Unik
  pdf.text('Kode Unik:', totalsX, yPos);
  pdf.text(`Rp ${payment.unique_code.toLocaleString('id-ID')}`, totalsX + totalsWidth, yPos, { align: 'right' });
  yPos += 5;
  pdf.line(totalsX, yPos, totalsX + totalsWidth, yPos);
  yPos += 2;
  
  // Total line
  pdf.setLineWidth(0.5);
  pdf.line(totalsX, yPos, totalsX + totalsWidth, yPos);
  yPos += 6;
  
  // Total
  pdf.setFontSize(12);
  pdf.setTextColor(textColor);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total:', totalsX, yPos);
  pdf.text(`Rp ${payment.amount_with_code.toLocaleString('id-ID')}`, totalsX + totalsWidth, yPos, { align: 'right' });
  
  // Footer
  yPos = pdf.internal.pageSize.getHeight() - 40;
  pdf.setDrawColor(lightGray);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  pdf.setFontSize(9);
  pdf.setTextColor(grayColor);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for using PixelNova AI!', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(textColor);
  pdf.text(`Payment Reference: ${invoiceNo}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(grayColor);
  pdf.text('Metode Pembayaran: Transfer Bank', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  pdf.text(`Tanggal Pembayaran: ${format(new Date(payment.verified_at || payment.created_at), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}`, pageWidth / 2, yPos, { align: 'center' });
  
  // Download PDF
  pdf.save(`Invoice-${invoiceNo}.pdf`);
};
