import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const invoiceDateFull = format(new Date(payment.created_at), 'dd/MM/yyyy (O)', { locale: idLocale });
  
  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.background = 'white';
  container.style.padding = '60px';
  
  // Generate HTML invoice
  container.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white;">
      <!-- Header -->
      <div style="display: table; width: 100%; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #e5e7eb;">
        <div style="display: table-cell; width: 50%; vertical-align: top;">
          <h1 style="color: #2563eb; font-size: 32px; font-weight: 700; margin: 0 0 12px 0;">PixelNova AI</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">Enhance images instantly with AI-powered precision</p>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">Support: Whatsapp (+62 896-8761-0639)</p>
        </div>
        <div style="display: table-cell; width: 50%; text-align: right; vertical-align: top;">
          <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">Invoice ${invoiceNo}</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">${invoiceDateFull}</p>
        </div>
      </div>
      
      <!-- Invoice Details -->
      <div style="display: table; width: 100%; margin-bottom: 40px;">
        <div style="display: table-cell; width: 50%; vertical-align: top;">
          <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #374151;">From:</h3>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0;">
            <strong>PixelNova AI</strong><br>
            Enhance images instantly with AI-powered precision<br>
            support@pixelnovaai.com
          </p>
        </div>
        <div style="display: table-cell; width: 50%; vertical-align: top;">
          <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #374151;">To:</h3>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0;">
            <strong>${customerName}</strong><br>
            ${payment.user_email}
          </p>
        </div>
      </div>
      
      <!-- Invoice Table -->
      <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Description</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Tokens</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Amount</th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 16px 12px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">
              <strong>${
                // Check token_type first
                payment.token_type === 'subscription' && payment.subscription_plan 
                  ? `Paket ${payment.subscription_plan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` 
                  // Fallback: Check subscription_plan exists (for old data)
                  : payment.subscription_plan && payment.subscription_plan !== 'free'
                    ? `Paket ${payment.subscription_plan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                    // Check token_type for purchased
                    : payment.token_type === 'purchased' 
                      ? 'Top-Up Token' 
                      : 'Top-Up Token'
              }</strong>
              ${payment.bonus_tokens > 0 ? `<br><small style="color: #10b981;">+ ${payment.bonus_tokens} Bonus Tokens</small>` : ''}
            </td>
            <td style="padding: 16px 12px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">${payment.tokens_purchased} tokens</td>
            <td style="padding: 16px 12px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Rp ${payment.amount.toLocaleString('id-ID')}</td>
            <td style="padding: 16px 12px; font-size: 14px; color: #10b981; font-weight: 600; border-bottom: 1px solid #f3f4f6;">
              LUNAS
            </td>
          </tr>
        </tbody>
      </table>
      
      ${payment.unique_code > 0 ? `
      <!-- Unique Code Info -->
      <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 13px; color: #92400e;">
        <strong>Kode Unik:</strong> Rp ${payment.unique_code.toLocaleString('id-ID')}<br>
        <small>Kode unik ditambahkan untuk memudahkan verifikasi pembayaran</small>
      </div>
      ` : ''}
      
      <!-- Totals -->
      <div style="margin-left: auto; width: 300px; margin-top: 20px;">
        <div style="display: table; width: 100%; padding: 12px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
          <span style="display: table-cell; text-align: left;">Subtotal:</span>
          <span style="display: table-cell; text-align: right;">Rp ${payment.amount.toLocaleString('id-ID')}</span>
        </div>
        <div style="display: table; width: 100%; padding: 12px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
          <span style="display: table-cell; text-align: left;">Kode Unik:</span>
          <span style="display: table-cell; text-align: right;">Rp ${payment.unique_code.toLocaleString('id-ID')}</span>
        </div>
        <div style="display: table; width: 100%; padding: 16px 0 12px 0; font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb;">
          <span style="display: table-cell; text-align: left;">Total:</span>
          <span style="display: table-cell; text-align: right;">Rp ${payment.amount_with_code.toLocaleString('id-ID')}</span>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 60px; padding-top: 30px; border-top: 2px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 4px 0;">Thank you for using PixelNova AI!</p>
        <p style="margin-top: 12px; font-weight: 600; color: #374151; font-size: 14px;">Payment Reference: ${invoiceNo}</p>
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280; line-height: 1.8;">
          Metode Pembayaran: Transfer Bank<br>
          Tanggal Pembayaran: ${format(new Date(payment.verified_at || payment.created_at), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Download PDF
    pdf.save(`Invoice-${invoiceNo}.pdf`);
    
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};
