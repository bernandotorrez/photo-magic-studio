# Quick Start - Sistem Invoice

## Akses Invoice

1. **Login** ke aplikasi Photo Magic Studio
2. Klik menu **"Invoice"** di sidebar (icon FileText)
3. Anda akan melihat daftar invoice dari pembayaran yang sudah disetujui

## Tampilan Halaman Invoice

### Jika Belum Ada Invoice:
```
┌─────────────────────────────────────────┐
│  📄 Invoice                             │
├─────────────────────────────────────────┤
│                                         │
│         📄                              │
│    Belum ada invoice                    │
│                                         │
│  Invoice akan muncul setelah            │
│  pembayaran Anda disetujui              │
│                                         │
└─────────────────────────────────────────┘
```

### Jika Ada Invoice:
```
┌──────────────────────────────────────────────────────────────────────────┐
│  📄 Daftar Invoice                                                       │
├──────────────────────────────────────────────────────────────────────────┤
│ No. Invoice  │ Tanggal      │ Jenis        │ Token  │ Total    │ Action │
├──────────────────────────────────────────────────────────────────────────┤
│ INV-A1B2C3D4 │ 20 Des 2025  │ Paket BASIC  │ 30 +2  │ Rp 50,123│ [📥]   │
│ INV-E5F6G7H8 │ 15 Des 2025  │ Top-Up Token │ 100    │ Rp 100,456│ [📥]  │
└──────────────────────────────────────────────────────────────────────────┘
```

## Download Invoice PDF

1. Klik tombol **"Download PDF"** pada invoice yang ingin didownload
2. Tunggu beberapa detik (akan muncul loading spinner)
3. File PDF akan otomatis terdownload dengan nama:
   - Format: `Invoice_INV-XXXXXXXX_YYYYMMDD.pdf`
   - Contoh: `Invoice_INV-A1B2C3D4_20251220.pdf`

## Isi Invoice PDF

Invoice PDF berisi informasi lengkap:

### 1. Header Perusahaan
- **PHOTO MAGIC STUDIO**
- AI-Powered Photo Enhancement Platform
- www.photomagicstudio.com

### 2. Detail Invoice
- Nomor Invoice: INV-XXXXXXXX
- Tanggal: 20 Desember 2025
- Status: LUNAS
- Tanggal Verifikasi: 20 Desember 2025

### 3. Informasi Customer
- Nama: [Nama Lengkap Anda]
- Email: [Email Anda]

### 4. Detail Pembelian
```
┌────┬──────────────┬────────┬──────────────┬──────────────┐
│ No │ Deskripsi    │ Jumlah │ Harga Satuan │ Total        │
├────┼──────────────┼────────┼──────────────┼──────────────┤
│ 1  │ Paket BASIC  │ 30 tkn │ Rp 1,000     │ Rp 30,000    │
│ 2  │ Bonus Token  │ 2 tkn  │ Rp 0         │ Rp 0         │
└────┴──────────────┴────────┴──────────────┴──────────────┘
```

### 5. Ringkasan Pembayaran
```
Subtotal:        Rp 30,000
Kode Unik:       Rp 123
─────────────────────────
TOTAL:           Rp 30,123
```

### 6. Informasi Pembayaran
- Metode: Bank Transfer
- Status: LUNAS

### 7. Total Token Diterima
```
TOTAL TOKEN DITERIMA
32 TOKEN
(30 token + 2 bonus)
```

## Tips

✅ **Invoice otomatis tersedia** setelah admin menyetujui pembayaran Anda
✅ **Download kapan saja** - invoice tersimpan permanen di sistem
✅ **Format profesional** - cocok untuk keperluan administrasi dan pembukuan
✅ **Gratis** - tidak ada biaya untuk download invoice

## Troubleshooting

### Invoice tidak muncul?
- Pastikan pembayaran Anda sudah disetujui oleh admin
- Cek halaman "Payment History" untuk status pembayaran
- Tunggu 1-2 hari kerja untuk proses verifikasi

### Gagal download PDF?
- Pastikan browser Anda mengizinkan download
- Cek koneksi internet Anda
- Coba refresh halaman dan download ulang
- Jika masih gagal, hubungi support

### PDF tidak terbuka?
- Pastikan Anda memiliki PDF reader (Adobe Reader, browser, dll)
- File PDF mungkin corrupt, coba download ulang
- Cek apakah file terdownload dengan lengkap

## Support

Jika mengalami masalah dengan invoice:
1. Screenshot halaman invoice
2. Catat nomor invoice yang bermasalah
3. Hubungi support dengan informasi tersebut

---

**Catatan:** Invoice dibuat otomatis dan sah tanpa tanda tangan basah.
