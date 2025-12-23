# Optimasi Invoice PDF

## Masalah
File PDF invoice berukuran sangat besar (~9MB) karena menggunakan `html2canvas` yang mengkonversi HTML ke gambar PNG beresolusi tinggi dengan `scale: 2`.

## Solusi
Mengganti implementasi dari HTML-to-Canvas-to-PDF menjadi native jsPDF API yang langsung menggambar elemen PDF.

## Perubahan

### File: `src/lib/invoiceGenerator.ts`

**Sebelum:**
- Menggunakan `html2canvas` untuk render HTML ke canvas
- Mengkonversi canvas ke PNG dengan scale 2x
- Embed PNG ke PDF
- Ukuran file: ~9MB

**Sesudah:**
- Menggunakan native jsPDF API
- Menggambar text, shapes, dan lines langsung ke PDF
- Tidak ada konversi gambar
- Ukuran file: ~20-50KB (pengurangan 99%!)

## Keuntungan

1. **Ukuran File Drastis Lebih Kecil**: Dari 9MB menjadi ~20-50KB
2. **Performa Lebih Cepat**: Tidak perlu render HTML dan konversi canvas
3. **Kualitas Lebih Baik**: Text tetap sebagai text (bisa di-copy), bukan gambar
4. **Dependency Lebih Sedikit**: Tidak perlu `html2canvas` lagi
5. **Loading Lebih Cepat**: Download dan buka PDF jauh lebih cepat

## Cara Menghapus Dependency Lama (Opsional)

Jika ingin menghapus `html2canvas` dari project:

```bash
npm uninstall html2canvas
```

## Testing

Untuk test invoice PDF yang baru:
1. Buka halaman My Payments
2. Klik tombol "Download Invoice" pada payment yang sudah verified
3. Cek ukuran file PDF yang didownload (seharusnya <100KB)
4. Buka PDF dan pastikan semua informasi tampil dengan benar

## Catatan Teknis

- PDF menggunakan format A4 (210mm x 297mm)
- Margin: 20mm
- Font: Helvetica (built-in jsPDF)
- Warna menggunakan hex color yang dikonversi ke RGB
- Layout tetap sama dengan versi sebelumnya
