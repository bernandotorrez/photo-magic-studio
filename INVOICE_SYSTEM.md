# Sistem Invoice

## Deskripsi
Sistem invoice memungkinkan user untuk melihat dan mendownload invoice dalam format PDF untuk semua pembayaran yang sudah disetujui (approved).

## Fitur

### 1. Halaman Invoice (`/invoices`)
- Menampilkan daftar semua invoice dari pembayaran yang sudah disetujui
- Informasi yang ditampilkan:
  - Nomor Invoice (format: INV-XXXXXXXX)
  - Tanggal pembayaran
  - Jenis pembayaran (Paket Subscription atau Top-Up Token)
  - Jumlah token (termasuk bonus)
  - Total pembayaran
  - Status pembayaran
- Tombol download PDF untuk setiap invoice

### 2. Format PDF Invoice
Invoice PDF yang di-generate memiliki format profesional dengan informasi:

**Header:**
- Logo dan nama perusahaan: PIXELNOVA AI
- Tagline: AI-Powered Photo Enhancement Platform
- Website: www.photomagicstudio.com

**Detail Invoice:**
- Nomor Invoice
- Tanggal pembuatan
- Status pembayaran
- Tanggal verifikasi

**Informasi Customer:**
- Nama lengkap
- Email

**Tabel Item:**
- Deskripsi produk/paket
- Jumlah token
- Harga satuan
- Total
- Bonus token (jika ada)

**Ringkasan Pembayaran:**
- Subtotal
- Kode unik
- Total pembayaran

**Informasi Pembayaran:**
- Metode pembayaran
- Status: LUNAS
- Total token yang diterima (dengan highlight warna hijau)

**Footer:**
- Ucapan terima kasih
- Keterangan invoice otomatis

## Cara Menggunakan

### Untuk User:
1. Login ke aplikasi
2. Klik menu "Invoice" di sidebar
3. Lihat daftar invoice yang tersedia
4. Klik tombol "Download PDF" untuk mendownload invoice
5. File PDF akan otomatis terdownload dengan nama: `Invoice_INV-XXXXXXXX_YYYYMMDD.pdf`

### Untuk Developer:

#### Mengakses Halaman Invoice:
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/invoices');
```

#### Generate Invoice PDF Secara Manual:
```typescript
import { generateInvoicePDF } from '@/lib/invoiceGenerator';

// Payment object dari database
const payment = {
  id: 'uuid',
  user_email: 'user@example.com',
  amount: 50000,
  unique_code: 123,
  amount_with_code: 50123,
  tokens_purchased: 50,
  bonus_tokens: 2,
  price_per_token: 1000,
  payment_status: 'approved',
  payment_method: 'Bank Transfer',
  subscription_plan: 'basic',
  token_type: 'subscription',
  created_at: '2025-01-01T00:00:00Z',
  verified_at: '2025-01-01T12:00:00Z'
};

// Generate PDF
await generateInvoicePDF(payment, 'Nama Customer');
```

## Database

Invoice menggunakan data dari tabel `payments` dengan filter:
- `payment_status = 'approved'` (hanya pembayaran yang sudah disetujui)
- `user_id = current_user_id` (hanya invoice milik user yang login)

## Dependencies

Package yang digunakan:
- `jspdf` - Library untuk generate PDF
- `jspdf-autotable` - Plugin untuk membuat tabel di PDF
- `date-fns` - Format tanggal dalam bahasa Indonesia

## File Terkait

- `src/pages/Invoices.tsx` - Halaman utama invoice
- `src/lib/invoiceGenerator.ts` - Logic untuk generate PDF
- `src/components/Sidebar.tsx` - Menu navigasi (sudah ditambahkan link Invoice)
- `src/App.tsx` - Route configuration

## Catatan

- Invoice hanya tersedia untuk pembayaran dengan status "approved"
- Format PDF menggunakan layout A4 portrait
- Semua teks dalam bahasa Indonesia
- File PDF otomatis terdownload, tidak perlu preview
- Nomor invoice menggunakan 8 karakter pertama dari UUID payment
