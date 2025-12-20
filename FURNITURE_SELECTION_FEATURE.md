# Fitur Pilihan Furniture untuk Interior Design Virtual

## Deskripsi
Fitur ini memungkinkan user untuk memilih item furniture spesifik yang ingin ditambahkan ke ruangan kosong saat menggunakan enhancement "Virtual Staging" pada Interior Design AI.

## Cara Kerja

### 1. Upload Foto Interior
- User upload foto ruangan kosong atau yang ingin di-staging

### 2. Pilih Enhancement "Virtual Staging"
- Pilih enhancement "🛋️ Virtual Staging (Tambah Furniture)"
- Setelah dipilih, akan muncul section khusus untuk memilih furniture

### 3. Pilih Item Furniture
User dapat memilih dari 15 pilihan furniture yang tersedia:
- 🛋️ Sofa modern
- 🛏️ Kasur nyaman
- 📺 Meja TV minimalis
- 📚 Rak Buku
- 👔 Lemari pakaian
- 🍽️ Meja Makan
- ☕ Meja Kopi
- 🪑 Kursi
- 🟫 Karpet
- 💡 Lampu standing
- 🪴 Tanaman hias
- 🖼️ Lukisan dinding
- 🪟 Gorden
- 🪞 Cermin dinding
- 🖥️ Meja Kerja

### 4. Tambah Item Custom (Opsional)
- User juga bisa menambahkan item furniture lain yang tidak ada di pilihan
- Contoh: "vas bunga, bantal sofa, jam dinding"
- Pisahkan dengan koma untuk beberapa item

### 5. Preview Item Terpilih
- Sistem akan menampilkan preview item yang akan ditambahkan
- Menggabungkan item dari pilihan + item custom

### 6. Generate
- Klik tombol Generate untuk membuat gambar dengan furniture yang dipilih
- AI akan menambahkan furniture sesuai pilihan user ke dalam ruangan

## Keuntungan Fitur Ini

1. **Kontrol Lebih Baik**: User bisa menentukan furniture apa saja yang ingin ditambahkan
2. **Fleksibel**: Bisa pilih dari daftar atau ketik manual
3. **Multiple Selection**: Bisa pilih lebih dari 1 item furniture sekaligus
4. **Visual Feedback**: Ada indikator visual untuk item yang dipilih
5. **Auto Reset**: Pilihan furniture otomatis di-reset jika user deselect Virtual Staging

## Implementasi Teknis

### State Management
```typescript
const [selectedFurnitureItems, setSelectedFurnitureItems] = useState<string[]>([]);
const [customFurniture, setCustomFurniture] = useState('');
```

### Fungsi Utama
- `handleToggleFurnitureItem()`: Toggle pilihan furniture
- `getFurnitureString()`: Menggabungkan item terpilih + custom menjadi string
- `handleToggleEnhancement()`: Reset furniture saat deselect Virtual Staging

### API Integration
Furniture string dikirim ke backend melalui parameter `customFurniture`:
```typescript
{
  originalImagePath: imagePath,
  classification: 'interior',
  enhancement: 'virtual staging',
  customFurniture: 'sofa modern, meja TV minimalis, rak buku'
}
```

## UI/UX
- Grid layout responsif (2 kolom di mobile, 3 kolom di desktop)
- Visual feedback dengan border dan background color
- Check icon untuk item terpilih
- Preview box untuk melihat item yang akan ditambahkan
- Disabled state saat generating

## File yang Dimodifikasi
- `src/components/dashboard/EnhancementOptions.tsx`

## Testing
1. Upload foto ruangan kosong
2. Pilih "Virtual Staging"
3. Pilih beberapa item furniture (misal: sofa, meja TV, karpet)
4. Tambahkan item custom (misal: "vas bunga")
5. Generate dan lihat hasilnya
6. Deselect Virtual Staging dan pastikan pilihan furniture ter-reset
